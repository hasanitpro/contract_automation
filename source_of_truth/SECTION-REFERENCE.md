# Form Section Reference Guide

## Quick Reference: Section Codes

This document explains what A1, A2, B1, B2, etc. mean in the developer documentation.

---

## 📋 MANDANTENMASKE (Client Form)

**A1 = Parteien & Kontakt (Parties & Contact)**
- Fields: rolle, eigene_name, eigene_anschrift, eigene_email, eigene_telefon, eigene_iban
- Fields: wird_vertreten, vertreten_durch, vollmacht, ust_id, steuernummer
- Fields: gegenpartei, gegenpartei_name, gegenpartei_anschrift, gegenpartei_email, gegenpartei_telefon

**A2 = Mietobjekt (Property)**
- Fields: objektadresse, wohnung_bez, wohnungsart, wohnflaeche
- Fields: aussenbereich (array), nebenraeume (array)
- Fields: stellplatz, stellplatz_nr, ausstattung
- Fields: weg, mea

**A3 = Zustand & Schlüssel (Condition & Keys)**
- Fields: zustand, bezugsfertig ⚠️ CRITICAL for rent control!
- Fields: uebergabeprotokoll, laerm
- Fields: schluessel_anzahl, schluessel_arten (array)

**A4 = Mietzeit (Rental Period)**
- Fields: mietbeginn, vertragsart
- Fields: mietende, befristungsgrund, befristungsgrund_text

**A5 = Miete & Kosten (Rent & Costs)**
- Fields: grundmiete, zuschlag_moeblierung, zuschlag_teilgewerbe, zuschlag_unterverm
- Fields: vz_heizung, vz_bk, stellplatzmiete
- Fields: zahlungsart, zahler_iban
- Fields: bk_modell, bk_weg

**A6 = Nutzung & Tiere (Usage & Pets)**
- Fields: nutzung, unterverm
- Fields: tiere, tiere_details

**A7 = Kaution & Übergabe (Deposit & Handover)**
- Fields: kaution, kaution_zahlweise, kautionsform
- Fields: uebergabedatum

---

## ⚖️ ANWALTSMASKE (Lawyer Form)

**B1 = Vertragsgestaltung (Contract Design)**
- Fields: vertragsart_final, kuendigungsverzicht

**B2 = Miethöhe/Anpassung (Rent Adjustment)**
- Fields: mietanpassung_normalfall, indexmiete, staffelmiete, staffelmiete_schedule, faelligkeit
- Fields: mpb_status, mpb_vormiet, mpb_grenze (Rent control cascade - only if bezugsfertig < 2014)
- Fields: mpb_vormiete, mpb_modern, mpb_erstmiete (Justifications)
- Fields: mpb_vormiete_betrag, mpb_modern_text, mpb_erstmiete_text (Details)

**B3 = Betriebskosten (Operating Costs)**
- Fields: zusatz_bk (array), weg_text, heiz_separat

**B4 = Nutzung & Pflichten (Usage & Obligations)**
- Fields: unterverm_klausel, tiere_ton
- Fields: bauveraenderung, besichtigung

**B5 = Instandhaltung (Maintenance & Repairs)**
- Fields: sr_renoviert, sr_unrenoviert_ohne, sr_unrenoviert_mit (3 cases based on zustand!)
- Fields: sr_zuschuss, sr_zuschuss_betrag, sr_mietfrei, sr_mietfrei_monate
- Fields: kleinrep_je, kleinrep_jahr, endrueckgabe

**B6 = Haftung & Sonstiges (Liability & Misc)**
- Fields: umgebung_laerm, aufrechnung, veraeusserung

**B7 = Anlagen (Annexes)** 
- Fields: anlagen (array)

---

## 🔍 How to Use This Reference

1. **Find section in forms:** Open the HTML form and search for the section heading
2. **Locate fields:** All fields in that section are grouped together visually
3. **Map to contract:** Check developer guide for which contract placeholders these fields map to

**Example:**
- You see "B2 = Miethöhe/Anpassung" in documentation
- Open anwaltsmaske-production.html
- Search for "Miethöhe" or "Rent Adjustment"
- You'll find all the fields: mietanpassung_normalfall, indexmiete, staffelmiete, etc.

---

## 📊 Total Field Count (After Simplification)

**Mandantenmaske:** 43 fields (removed 2: anwalt_email, abrz)
**Anwaltsmaske:** 37 fields (removed 5: korrektur, bearbeiter, bearbeitungsdatum, freigabe, dsgvo)
**Plus read-only:** 11 ro_* fields (display client data in lawyer form)

**Total:** 80 fields + 11 read-only = 91 form elements

---

## ⚠️ Critical Fields (Don't Skip!)

1. **bezugsfertig** (A3) - Triggers rent control logic in B2
2. **zustand** (A3) - Determines cosmetic repairs logic in B5
3. **rolle** (A1) - Determines who is landlord vs tenant
4. **weg** (A2) - Triggers condominium-specific fields
5. **vertragsart** (A4) - If "befristet" requires mietende + befristungsgrund

---

## 🚀 Quick Start for Developer

1. **See section codes** in this document
2. **Open HTML form** to see actual fields
3. **Check DEVELOPER-GUIDE-ENGLISH.md** for:
   - Field data types
   - Validation rules
   - Conditional logic
   - Contract placeholder mappings

**No need to memorize section codes!** Just use this as a quick lookup when you see "A3" or "B5" referenced in the documentation.
