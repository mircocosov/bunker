# Runbooks

## Reconnect storm
1. Check Redis and WS gateway health.
2. Enable protective flag for extended reconnect grace.
3. Monitor reconnect success ratio.

## WS latency spike
1. Verify CPU/GC pressure.
2. Scale gateway replicas.
3. Temporarily increase phase timers.

## Moderation spike
1. Enable strict word filter mode.
2. Increase temporary mute durations.
3. Assign extra moderators.
