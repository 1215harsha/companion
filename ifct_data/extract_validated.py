import pdfplumber, json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

PDF = r'C:\Users\harsh\OneDrive\Desktop\IFCT2017.pdf'
CAT = {
    'A':'Cereals and Millets','B':'Grain Legumes','C':'Green Leafy Vegetables',
    'D':'Other Vegetables','E':'Fruits','F':'Roots and Tubers',
    'G':'Condiments and Spices','H':'Nuts and Oil Seeds','I':'Sugars',
    'J':'Mushrooms','K':'Milk and Milk Products','L':'Egg and Egg Products',
    'M':'Meat and Meat Products','N':'Poultry','O':'Marine Fish',
    'P':'Freshwater Fish','Q':'Crustaceans','R':'Edible Oils and Fats',
}

def nums(s):
    out=[]
    for t in re.findall(r'\d+\.?\d*(?:±\d+\.?\d*)?',s):
        try: out.append(float(t.split('±')[0]))
        except: pass
    return out

def validate(w,p,ash,f,fb,c,ekj):
    total=w+p+ash+f+fb+c
    if not(75<=total<=120): return False,f"sum={total:.1f}"
    if ekj and ekj>0:
        calc=(p*17)+(f*37)+(c*17)
        r=calc/ekj
        if not(0.45<=r<=2.0): return False,f"energy ratio={r:.2f}"
    for val,lo,hi,nm in[(w,0,100,'water'),(p,0,50,'protein'),(f,0,100,'fat'),(c,0,100,'carbs'),(fb,0,80,'fibre')]:
        if not(lo<=val<=hi): return False,f"{nm}={val}"
    return True,"OK"

results={}; seen=set()
print("Extracting & validating IFCT2017 macros...")
with pdfplumber.open(PDF) as pdf:
    print(f"Pages: {len(pdf.pages)}")
    for pn,page in enumerate(pdf.pages):
        text=page.extract_text()
        if not text: continue
        for line in text.split('\n'):
            line=line.strip()
            m=re.match(r'^([A-R])(\d{3})\s+(.+)',line)
            if not m: continue
            cat_l,code_n,rest=m.group(1),m.group(2),m.group(3)
            code=f"{cat_l}{code_n}"
            if code in seen or cat_l not in CAT: continue
            clean=re.sub(r'\([^)]+\)',' ',rest).strip()
            nm=re.match(r'^(.*?)\s+([1-6])\s+\d',clean)
            if not nm: continue
            name=nm.group(1).strip().rstrip(',-. ')
            if not name or len(name)<2 or re.match(r'^[\d.\s]+$',name): continue
            ns=nums(clean[nm.start(2):])
            if len(ns)<10: continue
            n_r=ns[0]
            if not(1<=n_r<=6): continue
            w,p,ash,fat,fb,fb_i,fb_s,carb,ekj=ns[1],ns[2],ns[3],ns[4],ns[5],ns[6],ns[7],ns[8],ns[9]
            ok,reason=validate(w,p,ash,fat,fb,carb,ekj)
            if not ok: continue
            ekcal=round(ekj*0.239006,1)
            # Second check: Atwater kcal
            calc_kcal=(p*4.0)+(fat*9.0)+(carb*4.0)
            if ekcal>0 and not(0.45<=calc_kcal/ekcal<=2.0): continue
            results[code]={'code':code,'name':name,'category':CAT[cat_l],
                'protein_g':round(p,2),'fat_g':round(fat,2),'carbs_g':round(carb,2),
                'fibre_g':round(fb,2),'energy_kcal':ekcal,'water_g':round(w,2)}
            seen.add(code)

print(f"\nVALIDATED: {len(results)} foods")

# Print all accepted foods grouped by category
from collections import defaultdict
cats=defaultdict(list)
for d in results.values(): cats[d['category']].append(d)
for cat in sorted(cats):
    items=sorted(cats[cat],key=lambda x:x['code'])
    print(f"\n--- {cat} ({len(items)}) ---")
    for d in items:
        print(f"  {d['code']} {d['name']:40s} P:{d['protein_g']:5.1f} F:{d['fat_g']:5.1f} C:{d['carbs_g']:5.1f} Kcal:{d['energy_kcal']:6.1f}")

json.dump({'source':'IFCT2017','unit':'per 100g','total':len(results),
           'foods':dict(sorted(results.items()))},
          open('ifct_validated.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print(f"\nSaved ifct_validated.json")
