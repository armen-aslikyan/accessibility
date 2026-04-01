Clean up the file: $ARGUMENTS

If no file path is given in `$ARGUMENTS`, fall back to the currently open or selected file.

Steps to follow in order:

1. **Read the file** in full before making any changes.
2. **Remove dead code:** delete unused variables, imports, functions, and unreachable branches.
3. **Remove unnecessary comments:** delete commented-out code blocks, redundant inline comments that restate the code, and outdated TODO/FIXME items that no longer apply. Keep comments that explain *why*, not *what*.
4. **Apply DRY:** extract duplicated logic into shared helpers or constants. Do not create abstractions for code that only appears twice if the extraction would hurt readability.
5. **Simplify:** replace verbose constructs with idiomatic equivalents (e.g. optional chaining, nullish coalescing, array methods over loops where clear).
6. **Normalize style:** consistent naming conventions, consistent spacing/formatting — match whatever convention already exists in the file.
7. **Do not change behavior:** no logic changes, no API changes, no renaming of exported symbols unless they are clearly wrong.
8. **Do not add:** no new features, no new error handling, no new comments, no docstrings.

After making changes, briefly list what was removed or restructured and why.
