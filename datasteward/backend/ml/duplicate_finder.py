from __future__ import annotations
from datasketch import MinHash, MinHashLSH

class DuplicateFinder:
    def __init__(self, threshold: float = 0.8, num_perm: int = 128):
        self.threshold = threshold
        self.num_perm = num_perm
        self.lsh = MinHashLSH(threshold=threshold, num_perm=num_perm)
        self._minhashes: dict[str, MinHash] = {}
    
    def _make_minhash(self, text: str) -> MinHash:
        m = MinHash(num_perm=self.num_perm)
        for word in text.lower().split():
            m.update(word.encode("utf-8"))
        for i in range(len(text) - 2):
            m.update(text[i:i+3].encode("utf-8"))
        return m
    
    def add_record(self, record_id: str, text: str) -> None:
        mh = self._make_minhash(text)
        self._minhashes[record_id] = mh
        try:
            self.lsh.insert(record_id, mh)
        except ValueError:
            pass
    
    def find_duplicates(self, record_id: str, text: str) -> list[str]:
        mh = self._make_minhash(text)
        candidates = self.lsh.query(mh)
        return [c for c in candidates if c != record_id]
    
    def find_all_duplicates(self) -> list[tuple[str, str]]:
        pairs = []
        seen = set()
        for rid, mh in self._minhashes.items():
            candidates = self.lsh.query(mh)
            for c in candidates:
                if c != rid:
                    pair = tuple(sorted([rid, c]))
                    if pair not in seen:
                        seen.add(pair)
                        pairs.append(pair)
        return list(pairs)
