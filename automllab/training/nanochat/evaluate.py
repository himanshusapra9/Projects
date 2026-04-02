"""Validation loss computation."""
from __future__ import annotations

import torch
import torch.nn.functional as F


@torch.no_grad()
def compute_val_loss(model: torch.nn.Module, val_data: torch.Tensor, context_length: int = 2048) -> float:
    model.eval()
    losses = []
    for i in range(0, len(val_data) - context_length, context_length):
        x = val_data[i : i + context_length].unsqueeze(0)
        y = val_data[i + 1 : i + context_length + 1].unsqueeze(0)
        logits = model(x)
        loss = F.cross_entropy(logits.view(-1, logits.size(-1)), y.view(-1))
        losses.append(loss.item())
    model.train()
    return sum(losses) / max(len(losses), 1)
