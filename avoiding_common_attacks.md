# Security measures

1. `Floating pragma`: Charlize uses a specific pragma compiler, 0.8.10.
2. `Modifiers only for validation`: Charlize's modifiers employ require statements. They are used to avoid external accounts or contracts to call public functions inside Charlize that because of their functionality require verification of the sender.
3. `Timestamp dependence`: Even though the main functionality is based on time, it is not time-dependent as timing is needless to be precise, and expiration periods are considerably more extended than times between blocks. Thus, manipulations of the timestamp of blocks don't affect Charlize.
