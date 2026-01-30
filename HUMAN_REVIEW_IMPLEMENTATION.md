# Human Review Implementation for axe-core,manual Tests

## Overview

Updated audit system to properly handle `axe-core,manual` test methods: automated tests run AND results are included in reports, but with clear notices that human review is required for full compliance.

## What Changed (2026-01-30)

### 1. **audit.js** ✅

**Enhanced Console Output:**

- Split `automatedWithHumanCheck` section into two subsections:
  - **❌ Failed automated tests** - Shows violations with human review notice
  - **✅ Passed automated tests** - Lists criteria that passed but still need review
  
- **Different notices based on testMethod:**
  - `axe-core,manual`: "Partial automation - manual verification required for full compliance"
  - Others: "Quality and relevance of implementation"

**Before:**
```
🤖👤 AUTOMATED + HUMAN CHECK REQUIRED - 12 criteria
✅ Passed automated: 8
❌ Failed automated: 4
⚠️  All require human verification
[only showed violations]
```

**After:**
```
🤖👤 AUTOMATED + HUMAN CHECK REQUIRED - 12 criteria
✅ Passed automated: 8
❌ Failed automated: 4
⚠️  All 12 require human verification for quality and relevance

❌ FAILED AUTOMATED TESTS (need human review):
[detailed violations with specific human review notice]

✅ PASSED AUTOMATED TESTS (still need human review):
[list of passed criteria that need review]
```

### 2. **rgaaReport.js** ✅

**Added Human Review Notices in HTML Report:**

For criteria with `testMethod: "axe-core,manual"`:

**When FAILED:**
```html
<div class="bg-orange-100 border-l-4 border-orange-500 p-3 mb-3">
    <p class="text-xs text-orange-900 font-bold">
        👤 IMPORTANT: Ce critère nécessite une vérification manuelle complète 
        en plus des tests automatisés. Les tests axe-core détectent certains 
        problèmes mais une validation humaine est obligatoire pour la 
        conformité totale.
    </p>
</div>
```

**When PASSED:**
```html
<div class="bg-orange-100 border-l-4 border-orange-500 p-2 mt-2">
    <p class="text-xs text-orange-900 font-bold">
        👤 IMPORTANT: Tests automatisés réussis, mais vérification 
        manuelle obligatoire pour conformité complète.
    </p>
</div>
```

### 3. **declarationAccessibilite.js** ✅

**Added Human Review Notices in Accessibility Declaration:**

- Added `testMethod` to violations collection
- Display orange notice box for each `axe-core,manual` violation:

```html
<div class="bg-orange-100 border-l-2 border-orange-500 p-2 mt-2">
    <p class="text-xs text-orange-900 font-medium">
        👤 Vérification manuelle requise : Ce critère nécessite une 
        validation humaine complète en plus des tests automatisés.
    </p>
</div>
```

## The 12 Criteria Requiring Human Review

| RGAA | Description | axe-core Rules | Why Manual? |
|------|-------------|----------------|-------------|
| 3.1 | Color information | link-in-text-block | Must verify all info types, not just links |
| 4.1 | Media transcripts | video-caption, audio-caption | Presence detected, quality needs human check |
| 4.3 | Synchronized captions | video-caption | Presence detected, synchronization needs human check |
| 7.1 | Script compatibility | aria-* rules | Technical detection, but usability needs testing |
| 7.3 | Keyboard control | accesskeys, tabindex | Can detect issues, but full keyboard flow needs testing |
| 8.7 | Language changes | valid-lang | Detects markup, but relevance needs human check |
| 8.8 | Language code validity | valid-lang | Validates code format, not appropriateness |
| 10.4 | Text resizing | meta-viewport | Detects restrictive viewport, but actual behavior needs testing |
| 10.8 | Hidden content | aria-hidden-body | Detects usage, but intent needs human verification |
| 12.8 | Tab order coherence | focus-order-semantics, tabindex | Can detect issues, but logical flow needs human assessment |
| 13.1 | Time limit control | meta-refresh | Detects time limits, but control mechanisms need testing |
| 13.8 | Moving content control | blink | Detects blinking, but duration/controls need verification |

## Testing Strategy

### For Each axe-core,manual Criterion:

1. **Automated Phase (axe-core):**
   - Run automated tests
   - Flag technical violations (missing attributes, invalid values, etc.)
   - Include results in report with violation details

2. **Manual Phase (Human Auditor):**
   - Review automated test results
   - Verify quality, relevance, and appropriateness
   - Test actual behavior (keyboard navigation, time controls, etc.)
   - Assess user experience and context

3. **Reporting:**
   - Show both automated results AND human review requirement
   - Orange notice boxes clearly indicate manual verification needed
   - Specific guidance on what needs human verification

## Benefits

1. **Better Coverage:** 34 criteria now have some level of automated testing (vs 22 fully automated)
2. **Clear Expectations:** Auditors know exactly which tests still need human review
3. **Efficient Workflow:** Automated tests catch technical issues first, humans focus on quality/relevance
4. **Transparent Compliance:** Reports clearly show what's been tested and what still needs review

## Example Workflow

```bash
# Run audit
node audit.js

# Console shows:
✅ 22 fully automated criteria tested
🤖👤 12 partial automation + manual verification criteria tested
   - 8 passed automated (still need human review)
   - 4 failed automated (fix violations + human review)
👤 65 fully manual criteria listed
🤖 7 AI-assisted criteria listed

# HTML Reports show:
- Orange notice boxes for all axe-core,manual criteria
- Clear distinction between automated results and manual requirements
- Specific guidance on what humans need to verify
```

## Next Steps (Optional)

1. **Create Manual Test Checklist:** Generate detailed checklist for each axe-core,manual criterion
2. **Training Documentation:** Document what human reviewers should check for each criterion
3. **Workflow Integration:** Add manual review tracking system to record human verification results
4. **AI Enhancement:** For the 7 AI-assisted criteria, integrate vision/language models to help with quality checks

---

**Updated:** 2026-01-30  
**Files Modified:** audit.js, rgaaReport.js, declarationAccessibilite.js  
**Total Criteria with Human Review:** 84 (12 axe-core,manual + 65 manual + 7 ai)
