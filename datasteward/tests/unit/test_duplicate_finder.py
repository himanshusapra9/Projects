"""Tests for MinHash LSH duplicate finding."""
import pytest
from backend.ml.duplicate_finder import DuplicateFinder


def test_exact_duplicates_found():
    finder = DuplicateFinder(threshold=0.5, num_perm=128)
    finder.add_record("r1", "John Smith 123 Main Street New York NY 10001")
    finder.add_record("r2", "John Smith 123 Main Street New York NY 10001")
    finder.add_record("r3", "Jane Doe 456 Oak Avenue Los Angeles CA 90001")

    dupes = finder.find_duplicates("r1", "John Smith 123 Main Street New York NY 10001")
    assert "r2" in dupes
    assert "r3" not in dupes


def test_near_duplicates_found():
    finder = DuplicateFinder(threshold=0.5, num_perm=128)
    finder.add_record("r1", "John Smith 123 Main Street New York NY 10001")
    finder.add_record("r2", "John Smith 123 Main St New York NY 10001")
    finder.add_record("r3", "Completely different record about something else entirely")

    dupes = finder.find_duplicates("r1", "John Smith 123 Main Street New York NY 10001")
    assert "r2" in dupes


def test_100_records_with_10_near_dupes():
    finder = DuplicateFinder(threshold=0.5, num_perm=128)
    base_text = "Customer order for product ABC shipped to warehouse location XYZ"

    for i in range(90):
        finder.add_record(f"unique_{i}", f"Completely unique record number {i} with different content {i*17}")

    for i in range(10):
        variant = base_text.replace("ABC", f"AB{chr(67 + i % 3)}")
        finder.add_record(f"dupe_{i}", variant)

    all_dupes = finder.find_all_duplicates()
    dupe_ids = set()
    for a, b in all_dupes:
        dupe_ids.add(a)
        dupe_ids.add(b)
    dupe_count = sum(1 for d in dupe_ids if d.startswith("dupe_"))
    assert dupe_count >= 5, f"Expected at least 5 near-duplicates found, got {dupe_count}"


def test_no_duplicates_in_unique_data():
    finder = DuplicateFinder(threshold=0.8, num_perm=128)
    finder.add_record("r1", "Apple iPhone 15 Pro Max 256GB Black")
    finder.add_record("r2", "Samsung Galaxy S24 Ultra 512GB Silver")
    finder.add_record("r3", "Google Pixel 8 Pro 128GB White")

    dupes = finder.find_duplicates("r1", "Apple iPhone 15 Pro Max 256GB Black")
    assert "r2" not in dupes
    assert "r3" not in dupes
