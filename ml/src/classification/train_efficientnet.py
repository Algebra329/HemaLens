"""
Fine-tune EfficientNet-B0 on cropped RBC cells (13 classes -- see
data_prep.CLASS_NAMES; Ovalocyte and Elliptocyte are distinct classes).

Uses class-weighted Focal Loss for the ~34:1 imbalance and reports
per-class F1 as the real metric (accuracy is close to meaningless on this
dataset -- a model that always predicts "Normal" scores ~29% accuracy for
free and is clinically useless).

Augmentation: flips/rotations ONLY. Never scaling/resizing crops beyond a
fixed input size -- cell size is diagnostic (that's literally how
Macrocyte/Microcyte are defined), so scaling augmentation would teach the
model the wrong thing.

Input:  data/processed/crops/<ClassName>/*.png   (from data_prep.py)
Output: models/efficientnet_b0.pt                (checkpoint)
"""

import argparse
from pathlib import Path
from collections import Counter

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms as T
from PIL import Image
from sklearn.metrics import f1_score, classification_report

from efficientnet_pytorch import EfficientNet

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from data_prep import CLASS_NAMES  # noqa: E402

CLASS_LIST = [CLASS_NAMES[i] for i in sorted(CLASS_NAMES)]  # fixed index order, 0..12
NUM_CLASSES = len(CLASS_LIST)


class RBCCropDataset(Dataset):
    """Loads crops from data/processed/crops/<ClassName>/*.png."""

    def __init__(self, crops_dir: str, image_size=224, train=True):
        self.samples = []  # (path, class_idx)
        crops_dir = Path(crops_dir)
        for class_idx, class_name in enumerate(CLASS_LIST):
            class_dir = crops_dir / class_name
            if not class_dir.exists():
                continue
            for f in class_dir.glob("*.png"):
                self.samples.append((f, class_idx))

        if not self.samples:
            raise FileNotFoundError(
                f"No crops found under {crops_dir}. Run data_prep.py first."
            )

        # Flips/rotations only -- NEVER scale/crop-resize in a way that
        # changes apparent cell size relative to frame. Resize here is just
        # matching EfficientNet's expected input size uniformly across all
        # images (same resize for every sample, not a random scale aug).
        aug = [
            T.RandomHorizontalFlip(),
            T.RandomVerticalFlip(),
            T.RandomRotation(degrees=90),
        ] if train else []

        self.transform = T.Compose([
            *aug,
            T.Resize((image_size, image_size)),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, class_idx = self.samples[idx]
        image = Image.open(path).convert("RGB")
        return self.transform(image), class_idx

    def class_counts(self):
        counts = Counter(c for _, c in self.samples)
        return [counts.get(i, 0) for i in range(NUM_CLASSES)]


class FocalLoss(nn.Module):
    """Multi-class focal loss with per-class alpha weighting."""

    def __init__(self, alpha: torch.Tensor, gamma: float = 2.0):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma

    def forward(self, logits, targets):
        log_probs = F.log_softmax(logits, dim=1)
        probs = log_probs.exp()
        targets_one_hot = F.one_hot(targets, num_classes=logits.size(1)).float()

        pt = (probs * targets_one_hot).sum(dim=1)
        alpha_t = self.alpha[targets]
        loss = -alpha_t * (1 - pt) ** self.gamma * (log_probs * targets_one_hot).sum(dim=1)
        return loss.mean()


def build_model(num_classes=NUM_CLASSES, pretrained=True):
    if pretrained:
        model = EfficientNet.from_pretrained("efficientnet-b0", num_classes=num_classes)
    else:
        model = EfficientNet.from_name("efficientnet-b0", num_classes=num_classes)
    return model


def compute_alpha(class_counts, eps=1.0):
    """Inverse-frequency alpha weights for Focal Loss, normalized to sum to num_classes."""
    counts = torch.tensor(class_counts, dtype=torch.float32) + eps
    inv = 1.0 / counts
    alpha = inv / inv.sum() * len(counts)
    return alpha


def evaluate(model, loader, device):
    model.eval()
    all_preds, all_targets = [], []
    with torch.no_grad():
        for images, targets in loader:
            images = images.to(device)
            logits = model(images)
            preds = logits.argmax(dim=1).cpu()
            all_preds.extend(preds.tolist())
            all_targets.extend(targets.tolist())

    macro_f1 = f1_score(all_targets, all_preds, average="macro", zero_division=0)
    report = classification_report(
        all_targets, all_preds, target_names=CLASS_LIST,
        zero_division=0, labels=list(range(NUM_CLASSES)),
    )
    return macro_f1, report


def train(data_root: str, out_path: str, epochs: int = 20, batch_size: int = 32,
          lr: float = 1e-4, image_size: int = 224, val_fraction: float = 0.15,
          pretrained: bool = True, device: str = None):
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")

    crops_dir = f"{data_root}/processed/crops"
    full_train_ds = RBCCropDataset(crops_dir, image_size=image_size, train=True)
    full_eval_ds = RBCCropDataset(crops_dir, image_size=image_size, train=False)

    val_size = max(1, int(len(full_train_ds) * val_fraction))
    train_size = len(full_train_ds) - val_size
    generator = torch.Generator().manual_seed(42)
    train_subset, val_subset = random_split(full_train_ds, [train_size, val_size], generator=generator)
    # val should use the non-augmented transform pipeline -- reuse indices on full_eval_ds
    val_ds = torch.utils.data.Subset(full_eval_ds, val_subset.indices)

    train_loader = DataLoader(train_subset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    alpha = compute_alpha(full_train_ds.class_counts()).to(device)
    loss_fn = FocalLoss(alpha=alpha, gamma=2.0)

    model = build_model(pretrained=pretrained).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    best_f1 = -1.0
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for images, targets in train_loader:
            images, targets = images.to(device), targets.to(device)
            optimizer.zero_grad()
            logits = model(images)
            loss = loss_fn(logits, targets)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * images.size(0)
        train_loss /= len(train_subset)

        val_f1, report = evaluate(model, val_loader, device)
        print(f"epoch {epoch:3d}/{epochs}  train_loss={train_loss:.4f}  val_macro_F1={val_f1:.4f}")

        if val_f1 > best_f1:
            best_f1 = val_f1
            torch.save({
                "model_state": model.state_dict(),
                "val_macro_f1": val_f1,
                "class_list": CLASS_LIST,
            }, out_path)
            best_report = report

    print(f"\nBest val macro F1: {best_f1:.4f} -- saved to {out_path}")
    print("\nPer-class report at best checkpoint:")
    print(best_report)
    return best_f1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-root", default="../data")
    parser.add_argument("--out", default="../models/efficientnet_b0.pt")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--no-pretrained", action="store_true",
                         help="Train from scratch instead of ImageNet-pretrained weights (not recommended)")
    args = parser.parse_args()

    train(args.data_root, args.out, epochs=args.epochs, batch_size=args.batch_size,
          lr=args.lr, pretrained=not args.no_pretrained)
