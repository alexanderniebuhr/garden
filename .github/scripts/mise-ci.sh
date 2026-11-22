#!/usr/bin/env bash
set -euo pipefail

NO_COLOR=1 mise run --no-deps --output keep-order ci 2>&1 | awk '
  BEGIN { count = split("check lint audit dedupe build", tasks, " ") }
  /^\[(check|lint|audit|dedupe|build)\]/ {
    task = substr($1, 2, length($1) - 2)
    logs[task] = logs[task] $0 "\n"
    next
  }
  { print }
  END {
    for (i = 1; i <= count; i++) {
      task = tasks[i]
      if (!(task in logs)) continue
      print "::group::mise " task
      printf "%s", logs[task]
      print "::endgroup::"
    }
  }
'
