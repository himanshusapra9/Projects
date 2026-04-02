"""Dataset loading and tokenization utilities."""
from __future__ import annotations

import torch
from torch.utils.data import Dataset


class TextDataset(Dataset):
    def __init__(self, text: str, context_length: int = 2048):
        self.tokens = [ord(c) % 256 for c in text]
        self.context_length = context_length

    def __len__(self) -> int:
        return max(1, len(self.tokens) - self.context_length)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor]:
        chunk = self.tokens[idx : idx + self.context_length + 1]
        x = torch.tensor(chunk[:-1], dtype=torch.long)
        y = torch.tensor(chunk[1:], dtype=torch.long)
        return x, y
