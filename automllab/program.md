# Research Goal
Improve the training efficiency of the nanochat model on the Shakespeare dataset.
Target: reduce val_loss below 0.80 within 8 hours using a single GPU.
Prioritize learning rate schedule experiments and attention mechanism variants.
Do not change the dataset or tokenizer.

# Baseline
- Model: GPT-style transformer, 6 layers, 6 heads, 384 d_model, 2048 context
- Training: 5000 steps, batch_size=64, lr=3e-4, constant LR schedule
- Baseline val_loss: 0.862
- Baseline training_time: 4.2 minutes/run

# Constraints
- Max GPU memory: 35GB
- Max experiment duration: 8 minutes
- Max total budget: 8 hours
- Do not modify: data/, model/tokenizer.py, evaluate.py
- Allowed to modify: model/transformer.py, train.py

# Research Hypotheses
1. Cosine annealing LR schedule may outperform constant LR
2. Warmup steps (500-2000) before peak LR may stabilize training
3. Pre-norm (LayerNorm before attention) vs post-norm tradeoff worth testing
4. Weight decay 0.01 → 0.1 may reduce overfitting on small dataset
5. Gradient clipping at 1.0 may help with training stability

# Success Criteria
- Primary: val_loss < 0.80
- Secondary: training_speed_tokens_per_second (maintain or improve)

# Agent Configuration
- Strategy: bayesian_adaptive
- Parallelism: 1
- Checkpoint_frequency: every_improvement
- Auto_continue: true
