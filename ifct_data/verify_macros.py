import json, sys
sys.stdout.reconfigure(encoding='utf-8')
d = json.load(open('ifct_validated.json', encoding='utf-8'))
f = d['foods']

checks = [
    ('A015', 7.94,  0.52,  78.24, 356.4),  # Rice raw milled
    ('A019', 10.57, 1.53,  64.17, 320.3),  # Wheat atta
    ('B001', 21.55, 5.31,  46.72, 329.1),  # Bengal gram dal
    ('B010', 23.88, 1.35,  52.59, 325.8),  # Green gram dal
    ('B024', 35.58, 19.82, 12.79, 381.5),  # Soybean brown
    ('H001', 18.41, 58.49, 3.04,  None),   # Almond
    ('H005', 18.78, 45.20, 25.46, None),   # Cashew
    ('H021', 14.90, 64.30, 10.10, None),   # Walnut
    ('A009', 13.11, 5.50,  53.65, 328.4),  # Quinoa
    ('A010', 7.16,  1.92,  66.82, 320.7),  # Ragi
]

print("=== SPOT CHECK — DOUBLE VERIFIED vs IFCT2017 ===\n")
all_ok = True
for code, exp_p, exp_fat, exp_c, exp_e in checks:
    if code not in f:
        print(f"MISSING: {code}")
        continue
    fd = f[code]
    issues = []
    if abs(fd['protein_g'] - exp_p) > 1.5:   issues.append(f"protein got={fd['protein_g']} expected={exp_p}")
    if abs(fd['fat_g']     - exp_fat) > 2.0:  issues.append(f"fat got={fd['fat_g']} expected={exp_fat}")
    if abs(fd['carbs_g']   - exp_c) > 2.0:    issues.append(f"carbs got={fd['carbs_g']} expected={exp_c}")
    if exp_e and abs(fd['energy_kcal'] - exp_e) > 15: issues.append(f"kcal got={fd['energy_kcal']} expected={exp_e}")
    status = "✅ PASS" if not issues else "❌ FAIL"
    if issues: all_ok = False
    print(f"  {status}  {code}: {fd['name']}")
    print(f"         P:{fd['protein_g']}g  F:{fd['fat_g']}g  C:{fd['carbs_g']}g  {fd['energy_kcal']}kcal")
    for iss in issues:
        print(f"         ⚠ {iss}")
    print()

print("=" * 50)
print("ALL CHECKS PASSED" if all_ok else "SOME CHECKS FAILED — review above")
