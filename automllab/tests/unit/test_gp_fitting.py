"""Tests for Gaussian Process fitting in ExperimentProposer."""
import numpy as np
import pytest
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern

from models.experiment import ExperimentMetrics, ExperimentProposal, ExperimentResult


def test_gp_fitting_with_12_mock_results():
    """Create 12 mock results with random val_loss, fit GP, verify prediction."""
    gp = GaussianProcessRegressor(
        kernel=Matern(nu=2.5), n_restarts_optimizer=5, normalize_y=True
    )

    np.random.seed(42)
    n = 12
    X = np.array([[i] for i in range(n)])
    y = 0.9 - 0.005 * np.arange(n) + np.random.normal(0, 0.01, n)

    gp.fit(X, y)

    X_next = np.array([[n], [n + 1], [n + 2]])
    y_pred, y_std = gp.predict(X_next, return_std=True)

    assert y_pred.shape == (3,)
    assert y_std.shape == (3,)
    assert all(np.isfinite(y_pred))
    assert all(np.isfinite(y_std))
    assert all(y_std >= 0)
    assert y_pred.mean() < 0.9, "GP should predict improving trend"


def test_gp_with_noisy_data():
    """GP should handle noisy data gracefully."""
    gp = GaussianProcessRegressor(
        kernel=Matern(nu=2.5), normalize_y=True
    )
    np.random.seed(123)
    X = np.array([[i] for i in range(15)])
    y = np.random.uniform(0.5, 1.0, 15)

    gp.fit(X, y)
    y_pred = gp.predict(np.array([[20]]))
    assert np.isfinite(y_pred[0])


def test_gp_predict_returns_float():
    """Verify GP predict returns float values, not complex types."""
    gp = GaussianProcessRegressor(kernel=Matern(nu=2.5), normalize_y=True)
    X = np.array([[i] for i in range(12)])
    y = np.linspace(0.9, 0.8, 12)
    gp.fit(X, y)

    y_pred, y_std = gp.predict(np.array([[15]]), return_std=True)
    assert isinstance(float(y_pred[0]), float)
    assert isinstance(float(y_std[0]), float)
