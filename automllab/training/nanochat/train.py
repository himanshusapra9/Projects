"""Minimal training harness for nanochat model (reference implementation)."""
from __future__ import annotations

import argparse
import random
import sys
import time


def main() -> None:
    parser = argparse.ArgumentParser(description="NanoChat training script")
    parser.add_argument("--exp-id", type=str, default="baseline")
    parser.add_argument("--steps", type=int, default=100)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--batch-size", type=int, default=64)
    args = parser.parse_args()

    print(f"[{args.exp_id}] Starting training with lr={args.lr}, steps={args.steps}")

    train_loss = 2.0
    val_loss = 1.5

    for step in range(1, args.steps + 1):
        train_loss *= 0.995 + random.uniform(-0.002, 0.002)
        train_loss = max(0.3, train_loss)

        if step % 10 == 0:
            val_loss = train_loss + random.uniform(0.05, 0.15)
            val_loss = max(0.35, val_loss)
            print(
                f"step={step} train_loss={train_loss:.4f} val_loss={val_loss:.4f}"
            )
        time.sleep(0.01)

    final_val_loss = train_loss + random.uniform(0.05, 0.12)
    final_val_loss = max(0.35, final_val_loss)
    print(f"[{args.exp_id}] Training complete. val_loss={final_val_loss:.4f}")


if __name__ == "__main__":
    main()
