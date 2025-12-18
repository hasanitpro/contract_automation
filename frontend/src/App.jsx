import { useMemo, useState } from "react";

const API_BASE = "http://localhost:7071/api";

const ChevronRight = () => <span>→</span>;
const ChevronLeft = () => <span>←</span>;
const Check = () => <span>✓</span>;
const FileText = () => <span>📄</span>;
const UploadIcon = () => <span>📤</span>;


/**********************
 * MANDANTENMASKE (MASK A)
 **********************/
function MandantenMaske() {
  const [currentStep, setCurrentStep] = useState(0);
  const initialState = {
    rolle: "",
    eigene_name: "",
    eigene_anschrift: "",
    eigene_email: "",
    eigene_telefon: "",
    eigene_iban: "",
    wird_vertreten: "",
    vertreten_durch: "",
    vollmacht: "",
    ustId: "",
    steuernummer: "",
    gegenparteiBekannt: "",
    gegenparteiName: "",
    gegenparteiAnschrift: "",
    gegenparteiEmail: "",
    gegenparteiTelefon: "",
    objektadresse: "",
    wohnung_bez: "",
    wohnungsart: "",
    wohnflaeche: "",
    bezugsfertig: "",
    aussenbereich: [],
    nebenraeume: [],
    stellplatz: "",
    stellplatzNummer: "",
    mitvermieteteAusstattung: "",
    weg: "",
    miteigentumsanteile: "",
    grundrissDatei: "",
    wegDokument: "",
    zustand: "",
    uebergabeprotokoll: null,
    laerm: "",
    schluessel_arten: [],
    schluessel_anzahl: "",
    mietbeginn: "",
    mietende: "",
    vertragsart: "",
    befristungsgrund: "",
    befristungsgrund_text: "",
    grundmiete: "",
    zuschlagMoebliert: "",
    zuschlagGewerbe: "",
    zuschlagUntervermietung: "",
    vz_heizung: "",
    vz_bk: "",
    stellplatzmiete: "",
    zahlungsart: "",
    zahlerIban: "",
    bk_modell: "",
    abrechnungszeitraum: "",
    bkweg: "",
    nutzung: "",
    unterverm: "",
    haustiere: "",
    tiere_details: "",
    kaution: "3",
    kautionZahlweise: "",
    kautionsform: "",
    uebergabedatum: "",
  };
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const steps = [
    "Rolle & Kontakt",
    "Mietobjekt",
    "Zustand & Schlüssel",
    "Mietzeit",
    "Miete & Kosten",
    "Nutzung & Tiere",
    "Kaution & Übergabe",
    "Zusammenfassung",
  ];

  const stepDescriptions = [
    "Rolle, Kontakt und Gegenpartei",
    "Adresse, Ausstattung und WEG",
    "Zustand bei Übergabe",
    "Mietbeginn und Vertragsart",
    "Miete, Zuschläge und BK",
    "Nutzung, Untervermietung, Tiere",
    "Kaution und Zahlungsform",
    "Abschließende Kontrolle",
  ];

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const clone = { ...prev };
        delete clone[field];
        return clone;
      });
    }
  };

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      const next = exists
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value || "0");
    if (Number.isNaN(num)) return "0,00 EUR";
    return `${num.toFixed(2).replace(".", ",")} EUR`;
  };

  const calculateTotalRent = () => {
    const toNumber = (val) => parseFloat(val || "0") || 0;
    const total =
      toNumber(formData.grundmiete) +
      toNumber(formData.zuschlagMoebliert) +
      toNumber(formData.zuschlagGewerbe) +
      toNumber(formData.zuschlagUntervermietung) +
      toNumber(formData.vz_heizung) +
      toNumber(formData.vz_bk) +
      toNumber(formData.stellplatzmiete);
    return formatCurrency(total);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.rolle)
        newErrors.rolle = "Bitte wählen Sie Ihre Rolle.";
      if (!formData.eigene_name)
        newErrors.eigene_name = "Name ist erforderlich.";
      if (!formData.eigene_anschrift)
        newErrors.eigene_anschrift = "Anschrift ist erforderlich.";
      if (!formData.eigene_email)
        newErrors.eigene_email = "E-Mail ist erforderlich.";
      if (!formData.eigene_telefon)
        newErrors.eigene_telefon = "Telefon ist erforderlich.";
      if (!formData.eigene_iban)
        newErrors.eigene_iban = "IBAN ist erforderlich.";
      if (formData.wird_vertreten === "ja" && !formData.vertreten_durch)
        newErrors.vertreten_durch = "Bitte benennen Sie den Vertreter.";
      if (formData.wird_vertreten === "ja" && !formData.vollmacht)
        newErrors.vollmacht = "Bitte wählen Sie eine Option zur Vollmacht.";
      if (formData.gegenparteiBekannt === "ja") {
        if (!formData.gegenparteiName)
          newErrors.gegenparteiName = "Name der Gegenpartei ist erforderlich.";
        if (!formData.gegenparteiAnschrift)
          newErrors.gegenparteiAnschrift = "Bitte geben Sie die Anschrift an.";
        if (!formData.gegenparteiEmail)
          newErrors.gegenparteiEmail = "Bitte geben Sie eine E-Mail an.";
      }
    }

    if (step === 1) {
      if (!formData.objektadresse)
        newErrors.objektadresse = "Objektadresse ist erforderlich.";
      if (!formData.wohnungsart)
        newErrors.wohnungsart = "Bitte wählen Sie die Wohnungsart.";
      if (!formData.wohnflaeche)
        newErrors.wohnflaeche = "Wohnfläche ist erforderlich.";
      if (!formData.bezugsfertig)
        newErrors.bezugsfertig = "Bitte wählen Sie das Bezugsfertig-Datum.";
      if (!formData.weg)
        newErrors.weg = "Bitte wählen Sie eine Option zur WEG.";
    }

    if (step === 2) {
      if (!formData.zustand)
        newErrors.zustand = "Bitte wählen Sie den Zustand.";
      if (formData.uebergabeprotokoll === null)
        newErrors.uebergabeprotokoll =
          "Bitte wählen Sie, ob ein Übergabeprotokoll geführt wird.";
      if (!formData.laerm)
        newErrors.laerm = "Bitte wählen Sie die Lärmquelle aus.";
      if (!formData.schluessel_arten?.length)
        newErrors.schluessel_arten =
          "Bitte wählen Sie mindestens eine Schlüsselart aus.";
      if (!formData.schluessel_anzahl)
        newErrors.schluessel_anzahl = "Bitte geben Sie die Schlüsselanzahl an.";
    }

    if (step === 3) {
      if (!formData.mietbeginn)
        newErrors.mietbeginn = "Mietbeginn ist erforderlich.";
      if (!formData.vertragsart)
        newErrors.vertragsart = "Bitte wählen Sie die Vertragsart.";
      if (formData.vertragsart === "Befristet") {
        if (!formData.mietende)
          newErrors.mietende = "Bitte geben Sie das Mietende an.";
        if (!formData.befristungsgrund)
          newErrors.befristungsgrund = "Bitte wählen Sie den Befristungsgrund.";
        if (!formData.befristungsgrund_text)
          newErrors.befristungsgrund_text =
            "Bitte begründen Sie die Befristung.";
      }
    }

    if (step === 4) {
      if (!formData.grundmiete)
        newErrors.grundmiete = "Grundmiete ist erforderlich.";
      if (!formData.zahlungsart)
        newErrors.zahlungsart = "Bitte wählen Sie die Zahlungsart.";
      if (!formData.bk_modell)
        newErrors.bk_modell = "Bitte wählen Sie das Betriebskostenmodell.";
      if (!formData.abrechnungszeitraum)
        newErrors.abrechnungszeitraum = "Bitte wählen Sie den Abrechnungszeitraum.";
      if (!formData.bkweg)
        newErrors.bkweg = "Bitte wählen Sie eine Option zur BK-Umlage.";
      if (!formData.vz_heizung)
        newErrors.vz_heizung = "Bitte geben Sie die Vorauszahlung Heizung/Warmwasser an.";
      if (!formData.vz_bk)
        newErrors.vz_bk = "Bitte geben Sie die Betriebskosten-Vorauszahlung an.";
    }

    if (step === 5) {
      if (!formData.nutzung)
        newErrors.nutzung = "Bitte wählen Sie die Nutzung.";
      if (!formData.unterverm)
        newErrors.unterverm = "Bitte geben Sie eine Angabe zur Untervermietung an.";
      if (!formData.haustiere)
        newErrors.haustiere = "Bitte wählen Sie eine Option zur Tierhaltung.";
      if (
        formData.haustiere === "sondervereinbarung" &&
        !formData.tiere_details
      ) {
        newErrors.tiere_details = "Bitte beschreiben Sie die Sondervereinbarung.";
      }
    }

    if (step === 6) {
      if (!formData.kaution)
        newErrors.kaution = "Bitte geben Sie die Kautionshöhe an.";
      if (!formData.kautionZahlweise)
        newErrors.kautionZahlweise = "Bitte wählen Sie die Zahlweise.";
      if (!formData.kautionsform)
        newErrors.kautionsform = "Bitte wählen Sie die Kautionsform.";
      if (!formData.uebergabedatum)
        newErrors.uebergabedatum = "Bitte wählen Sie das Übergabedatum.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportJSON = async () => {
    if (!validateStep(currentStep)) return;
    const output = {
      ...formData,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(`${API_BASE}/save_mask_a`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(output),
      });
    } catch (e) {
      console.error("Fehler beim Senden an Azure:", e);
      alert(
        "Die Daten konnten nicht an den Server gesendet werden. Die JSON-Datei wird trotzdem lokal gespeichert."
      );
    }

    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mandantendaten_${new Date().toISOString().split("T")[0]
      }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStepper = () => (
    <div className="stepper-v2">
      {steps.map((title, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;
        return (
          <div
            key={title}
            className={`stepper-step ${isActive ? "active" : ""
              } ${isDone ? "completed" : ""}`}
          >
            <div className="stepper-icon">
              {isDone ? "✓" : index + 1}
            </div>
            <div>
              <div className="stepper-title">{title}</div>
              <div className="stepper-desc">{stepDescriptions[index]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-section-v2">
            <h2 className="section-title-v2">Rolle & Kontaktdaten</h2>
            <p className="tagline">
              Bitte geben Sie Ihre Kontaktdaten und Informationen zur Gegenpartei
              an.
            </p>

            <div className="field-v2">
              <label>
                Ihre Rolle im Mietvertrag <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["Vermieter", "Vermieter"],
                  ["Mieter", "Mieter"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.rolle === value}
                      onChange={(e) => updateFormData("rolle", e.target.value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.rolle && <div className="error-text">{errors.rolle}</div>}
            </div>

            <div className="info-box-v2">
              <strong>Ihre Angaben</strong>
            </div>

            <div className="field-v2">
              <label>
                Name / Firma <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.eigene_name ? "error" : ""}`}
                value={formData.eigene_name}
                onChange={(e) => updateFormData("eigene_name", e.target.value)}
                placeholder="Max Mustermann bzw. Muster GmbH"
              />
              {errors.eigene_name && (
                <div className="error-text">{errors.eigene_name}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Anschrift <span className="required">*</span>
              </label>
              <textarea
                className={`textarea ${errors.eigene_anschrift ? "error" : ""}`}
                value={formData.eigene_anschrift}
                onChange={(e) =>
                  updateFormData("eigene_anschrift", e.target.value)
                }
                placeholder="Musterstraße 1, 12345 Musterstadt"
                rows="2"
              ></textarea>
              {errors.eigene_anschrift && (
                <div className="error-text">{errors.eigene_anschrift}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                E-Mail <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`input ${errors.eigene_email ? "error" : ""}`}
                value={formData.eigene_email}
                onChange={(e) => updateFormData("eigene_email", e.target.value)}
                placeholder="beispiel@email.de"
              />
              {errors.eigene_email && (
                <div className="error-text">{errors.eigene_email}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Telefon <span className="required">*</span>
              </label>
              <input
                type="tel"
                className={`input ${errors.eigene_telefon ? "error" : ""}`}
                value={formData.eigene_telefon}
                onChange={(e) => updateFormData("eigene_telefon", e.target.value)}
                placeholder="+49 123 456789"
              />
              {errors.eigene_telefon && (
                <div className="error-text">{errors.eigene_telefon}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                IBAN (Zahlungsempfänger) <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.eigene_iban ? "error" : ""}`}
                value={formData.eigene_iban}
                onChange={(e) => updateFormData("eigene_iban", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
              />
              {errors.eigene_iban && (
                <div className="error-text">{errors.eigene_iban}</div>
              )}
            </div>

            <div className="field-v2">
              <label>Werden Sie vertreten?</label>
              <div className="radio-group-v2">
                {[
                  ["ja", "Ja"],
                  ["nein", "Nein"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.wird_vertreten === value}
                      onChange={(e) =>
                        updateFormData("wird_vertreten", e.target.value)
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.wird_vertreten === "ja" && (
              <div className="highlight-box">
                <div className="field-v2">
                  <label>
                    Vertreten durch (Name/Firma) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input ${errors.vertreten_durch ? "error" : ""}`}
                    value={formData.vertreten_durch}
                    onChange={(e) =>
                      updateFormData("vertreten_durch", e.target.value)
                    }
                    placeholder="z.B. Hausverwaltung Müller GmbH"
                  />
                  {errors.vertreten_durch && (
                    <div className="error-text">{errors.vertreten_durch}</div>
                  )}
                </div>

                <div className="field-v2">
                  <label>
                    Liegt eine Vollmacht bei? <span className="required">*</span>
                  </label>
                  <div className="radio-group-v2">
                    {[
                      ["ja", "Ja, liegt bei"],
                      ["nein", "Nein, wurde separat erteilt"],
                    ].map(([value, label]) => (
                      <label key={value} className="radio-option-v2">
                        <input
                          type="radio"
                          value={value}
                          checked={formData.vollmacht === value}
                          onChange={(e) =>
                            updateFormData("vollmacht", e.target.value)
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.vollmacht && (
                    <div className="error-text">{errors.vollmacht}</div>
                  )}
                </div>
              </div>
            )}

            <div className="field-v2">
              <label>USt-ID (optional)</label>
              <input
                type="text"
                className="input"
                value={formData.ustId}
                onChange={(e) => updateFormData("ustId", e.target.value)}
                placeholder="z.B. DE123456789"
              />
            </div>

            <div className="field-v2">
              <label>Steuernummer (optional)</label>
              <input
                type="text"
                className="input"
                value={formData.steuernummer}
                onChange={(e) => updateFormData("steuernummer", e.target.value)}
                placeholder="z.B. 12/345/67890"
              />
            </div>

            <div className="field-v2">
              <label>
                Ist die Gegenpartei bereits bekannt? <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["ja", "Ja"],
                  ["nein", "Nein"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.gegenparteiBekannt === value}
                      onChange={(e) =>
                        updateFormData("gegenparteiBekannt", e.target.value)
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.gegenparteiBekannt === "ja" && (
              <div className="info-box-v2">
                <strong>Angaben zur Gegenpartei</strong>
                <div className="field-v2" style={{ marginTop: "10px" }}>
                  <label>
                    Name / Firma <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input ${errors.gegenparteiName ? "error" : ""
                      }`}
                    value={formData.gegenparteiName}
                    onChange={(e) =>
                      updateFormData("gegenparteiName", e.target.value)
                    }
                    placeholder="Name der Gegenpartei"
                  />
                  {errors.gegenparteiName && (
                    <div className="error-text">{errors.gegenparteiName}</div>
                  )}
                </div>

                <div className="field-v2">
                  <label>
                    Anschrift <span className="required">*</span>
                  </label>
                  <textarea
                    className={`textarea ${errors.gegenparteiAnschrift ? "error" : ""
                      }`}
                    value={formData.gegenparteiAnschrift}
                    onChange={(e) =>
                      updateFormData("gegenparteiAnschrift", e.target.value)
                    }
                    rows="2"
                  ></textarea>
                  {errors.gegenparteiAnschrift && (
                    <div className="error-text">
                      {errors.gegenparteiAnschrift}
                    </div>
                  )}
                </div>

                <div className="field-v2">
                  <label>
                    E-Mail <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`input ${errors.gegenparteiEmail ? "error" : ""
                      }`}
                    value={formData.gegenparteiEmail}
                    onChange={(e) =>
                      updateFormData("gegenparteiEmail", e.target.value)
                    }
                  />
                  {errors.gegenparteiEmail && (
                    <div className="error-text">{errors.gegenparteiEmail}</div>
                  )}
                </div>

                <div className="field-v2">
                  <label>Telefon (optional)</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.gegenparteiTelefon}
                    onChange={(e) =>
                      updateFormData("gegenparteiTelefon", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="form-section-v2">
            <h2 className="section-title-v2">Mietobjekt</h2>
            <p className="tagline">Daten zum Mietobjekt und zur Ausstattung.</p>

            <div className="field-v2">
              <label>
                Objektadresse <span className="required">*</span>
              </label>
              <textarea
                className={`textarea ${errors.objektadresse ? "error" : ""}`}
                value={formData.objektadresse}
                onChange={(e) => updateFormData("objektadresse", e.target.value)}
                placeholder="Musterstraße 42, 12345 Musterstadt"
                rows="2"
              ></textarea>
              {errors.objektadresse && (
                <div className="error-text">{errors.objektadresse}</div>
              )}
            </div>

            <div className="field-v2">
              <label>Wohnung / Bezeichnung</label>
              <input
                type="text"
                className="input"
                value={formData.wohnung_bez}
                onChange={(e) =>
                  updateFormData("wohnung_bez", e.target.value)
                }
                placeholder="z.B. WE 3.2, 2. OG links"
              />
            </div>

            <div className="field-v2">
              <label>
                Wohnungsart <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.wohnungsart ? "error" : ""}`}
                value={formData.wohnungsart}
                onChange={(e) => updateFormData("wohnungsart", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option>Eigentumswohnung in Mehrfamilienhaus</option>
                <option>Einfamilienhaus</option>
                <option>Doppelhaushälfte</option>
                <option>Reihenhaus</option>
                <option>Einliegerwohnung</option>
                <option>Wohnung im Hochhaus</option>
                <option>Sonstiges</option>
              </select>
              {errors.wohnungsart && (
                <div className="error-text">{errors.wohnungsart}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Wohnfläche (m²) <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`input ${errors.wohnflaeche ? "error" : ""}`}
                value={formData.wohnflaeche}
                onChange={(e) => updateFormData("wohnflaeche", e.target.value)}
                placeholder="z.B. 75.5"
              />
              {errors.wohnflaeche && (
                <div className="error-text">{errors.wohnflaeche}</div>
              )}
            </div>

            <div className="highlight-box">
              <label>
                Bezugsfertig seit (Datum) <span className="required">*</span>
              </label>
              <input
                type="date"
                className={`input ${errors.bezugsfertig ? "error" : ""}`}
                value={formData.bezugsfertig}
                onChange={(e) =>
                  updateFormData("bezugsfertig", e.target.value)
                }
              />
              {errors.bezugsfertig && (
                <div className="error-text">{errors.bezugsfertig}</div>
              )}
              <p className="help-text" style={{ color: "#991b1b" }}>
                ⚠️ Wichtig: Dieses Datum ist entscheidend für die Mietpreisbremse!
              </p>
            </div>

            <div className="field-v2">
              <label>Außenbereich</label>
              <div className="checkbox-group-v2">
                {["Balkon", "Loggia", "Terrasse", "Keiner"].map(
                  (value) => (
                    <label key={value} className="checkbox-option-v2">
                      <input
                        type="checkbox"
                        checked={(formData.aussenbereich || []).includes(value)}
                        onChange={() => toggleSelection("aussenbereich", value)}
                      />
                      <span>{value}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="field-v2">
              <label>Nebenräume</label>
              <div className="checkbox-group-v2">
                {[
                  "Keller",
                  "Dachboden",
                  "Abstellraum",
                  "Fahrradraum (Mitbenutzung)",
                ].map((value) => (
                  <label key={value} className="checkbox-option-v2">
                    <input
                      type="checkbox"
                      checked={(formData.nebenraeume || []).includes(value)}
                      onChange={() => toggleSelection("nebenraeume", value)}
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field-v2">
              <label>Stellplatz</label>
              <select
                className="select"
                value={formData.stellplatz}
                onChange={(e) => updateFormData("stellplatz", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option>Kein Stellplatz</option>
                <option>Außenstellplatz</option>
                <option>Tiefgarage</option>
                <option>Carport</option>
              </select>
            </div>

            <div className="field-v2">
              <label>Stellplatz-Nummer (optional)</label>
              <input
                type="text"
                className="input"
                value={formData.stellplatzNummer}
                onChange={(e) =>
                  updateFormData("stellplatzNummer", e.target.value)
                }
                placeholder="z.B. TG-27"
              />
            </div>

            <div className="field-v2">
              <label>Mitvermietete Ausstattung (optional)</label>
              <input
                type="text"
                className="input"
                value={formData.mitvermieteteAusstattung}
                onChange={(e) =>
                  updateFormData("mitvermieteteAusstattung", e.target.value)
                }
                placeholder="z.B. Einbauküche"
              />
            </div>

            <div className="field-v2">
              <label>
                Wohnungseigentümergemeinschaft (WEG) <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["ja", "Ja"],
                  ["nein", "Nein"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.weg === value}
                      onChange={(e) => updateFormData("weg", e.target.value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.weg && <div className="error-text">{errors.weg}</div>}
            </div>

            <div className="field-v2">
              <label>Miteigentumsanteile (optional)</label>
              <input
                type="number"
                className="input"
                value={formData.miteigentumsanteile}
                onChange={(e) =>
                  updateFormData("miteigentumsanteile", e.target.value)
                }
                placeholder="z.B. 125.5"
              />
            </div>

            <div className="info-box-v2">
              <strong>Dokumente hochladen</strong>
              <div className="field-v2" style={{ marginTop: "10px" }}>
                <label>Grundriss / Plan (Dateiname wird gespeichert)</label>
                <input
                  type="file"
                  className="input"
                  onChange={(e) =>
                    updateFormData(
                      "grundrissDatei",
                      e.target.files?.[0]?.name || ""
                    )
                  }
                />
              </div>
              <div className="field-v2">
                <label>Teilungserklärung / WEG-Abrechnung</label>
                <input
                  type="file"
                  className="input"
                  onChange={(e) =>
                    updateFormData(
                      "wegDokument",
                      e.target.files?.[0]?.name || ""
                    )
                  }
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-section-v2">
            <h2 className="section-title-v2">Zustand & Schlüssel</h2>
            <p className="tagline">Zustand bei Übergabe und Schlüsselanzahl.</p>

            <div className="field-v2">
              <label>
                Zustand bei Übergabe <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.zustand ? "error" : ""}`}
                value={formData.zustand}
                onChange={(e) =>
                  updateFormData("zustand", e.target.value)
                }
              >
                <option value="">Bitte wählen...</option>
                <option>Renoviert</option>
                <option>Teilsaniert</option>
                <option>Unrenoviert</option>
              </select>
              {errors.zustand && (
                <div className="error-text">{errors.zustand}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Übergabeprotokoll <span className="required">*</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.uebergabeprotokoll === true}
                  onChange={(e) =>
                    updateFormData("uebergabeprotokoll", e.target.checked)
                  }
                />
                <span>Ja, Protokoll wird bei Übergabe geführt</span>
              </label>
              {errors.uebergabeprotokoll && (
                <div className="error-text">{errors.uebergabeprotokoll}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Umgebungslärm / Besonderheiten <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.laerm ? "error" : ""}`}
                value={formData.laerm}
                onChange={(e) => updateFormData("laerm", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option>keine besonderen Lärmquellen</option>
                <option>Straßen- / Verkehrslärm</option>
                <option>Fluglärm</option>
                <option>Bahn- / Tramverkehr</option>
                <option>Gastronomie / Clubbetrieb</option>
                <option>Sonstige Hinweise</option>
              </select>
              {errors.laerm && <div className="error-text">{errors.laerm}</div>}
            </div>

            <div className="field-v2">
              <label>
                Schlüsselarten <span className="required">*</span>
              </label>
              <div className="checkbox-group-v2">
                {["Wohnungsschlüssel", "Haustür", "Keller", "Briefkasten", "Tiefgarage / Stellplatz"].map(
                  (option) => (
                    <label key={option} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.schluessel_arten.includes(option)}
                        onChange={() => toggleSelection("schluessel_arten", option)}
                      />
                      <span>{option}</span>
                    </label>
                  )
                )}
              </div>
              {errors.schluessel_arten && (
                <div className="error-text">{errors.schluessel_arten}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Gesamtanzahl Schlüssel <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`input ${errors.schluessel_anzahl ? "error" : ""}`}
                value={formData.schluessel_anzahl}
                onChange={(e) =>
                  updateFormData("schluessel_anzahl", e.target.value)
                }
              />
              {errors.schluessel_anzahl && (
                <div className="error-text">{errors.schluessel_anzahl}</div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-section-v2">
            <h2 className="section-title-v2">Mietzeit</h2>
            <p className="tagline">Angaben zu Mietbeginn und Vertragsart.</p>

            <div className="field-v2">
              <label>
                Mietbeginn <span className="required">*</span>
              </label>
              <input
                type="date"
                className={`input ${errors.mietbeginn ? "error" : ""}`}
                value={formData.mietbeginn}
                onChange={(e) => updateFormData("mietbeginn", e.target.value)}
              />
              {errors.mietbeginn && (
                <div className="error-text">{errors.mietbeginn}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Vertragsart <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.vertragsart ? "error" : ""}`}
                value={formData.vertragsart}
                onChange={(e) => updateFormData("vertragsart", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option>Unbefristet</option>
                <option>Befristet</option>
                <option>Staffelmiete</option>
              </select>
              {errors.vertragsart && (
                <div className="error-text">{errors.vertragsart}</div>
              )}
            </div>

            {formData.vertragsart === "Befristet" && (
              <div className="highlight-box">
                <div className="field-v2">
                  <label>
                    Mietende <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    className={`input ${errors.mietende ? "error" : ""}`}
                    value={formData.mietende}
                    onChange={(e) => updateFormData("mietende", e.target.value)}
                  />
                  {errors.mietende && (
                    <div className="error-text">{errors.mietende}</div>
                  )}
                </div>

                <div className="field-v2">
                  <label>
                    Befristungsgrund <span className="required">*</span>
                  </label>
                  <select
                    className={`select ${errors.befristungsgrund ? "error" : ""}`}
                    value={formData.befristungsgrund}
                    onChange={(e) =>
                      updateFormData("befristungsgrund", e.target.value)
                    }
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="Eigenbedarf">Eigenbedarf nach Rückkehr</option>
                    <option value="Dienstlich">Dienstliche Versetzung</option>
                    <option value="Sanierung">Geplante Sanierung/Umbau</option>
                    <option value="Verkauf">Geplanter Verkauf</option>
                    <option value="Nutzungswechsel">Geplanter Nutzungswechsel</option>
                    <option value="Sonstiges">Sonstiger Grund</option>
                  </select>
                  {errors.befristungsgrund && (
                    <div className="error-text">{errors.befristungsgrund}</div>
                  )}
                </div>

                <div className="field-v2">
                  <label>
                    Begründung der Befristung <span className="required">*</span>
                  </label>
                  <textarea
                    className={`textarea ${errors.befristungsgrund_text ? "error" : ""}`}
                    value={formData.befristungsgrund_text}
                    onChange={(e) =>
                      updateFormData("befristungsgrund_text", e.target.value)
                    }
                    rows="3"
                    placeholder="Bitte geben Sie die gesetzlich erforderliche Begründung an"
                  ></textarea>
                  {errors.befristungsgrund_text && (
                    <div className="error-text">{errors.befristungsgrund_text}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="form-section-v2">
            <h2 className="section-title-v2">Miete & Kosten</h2>
            <p className="tagline">Grundmiete, Zuschläge und Betriebskosten.</p>

            <div className="field-v2">
              <label>
                Grundmiete / Monat (EUR) <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`input ${errors.grundmiete ? "error" : ""}`}
                value={formData.grundmiete}
                onChange={(e) => updateFormData("grundmiete", e.target.value)}
                placeholder="z.B. 1450"
              />
              {errors.grundmiete && (
                <div className="error-text">{errors.grundmiete}</div>
              )}
            </div>

            <div className="info-box-v2">
              <strong>Zuschläge (optional)</strong>
              <p className="help-text" style={{ marginTop: "4px" }}>
                Diese Zuschläge werden zur Grundmiete addiert.
              </p>
            </div>

            <div className="field-v2">
              <label>Zuschlag für Möblierung (EUR)</label>
              <input
                type="number"
                className="input"
                value={formData.zuschlagMoebliert}
                onChange={(e) =>
                  updateFormData("zuschlagMoebliert", e.target.value)
                }
                placeholder="z.B. 150"
              />
            </div>

            <div className="field-v2">
              <label>Zuschlag für teilgewerbliche Nutzung (EUR)</label>
              <input
                type="number"
                className="input"
                value={formData.zuschlagGewerbe}
                onChange={(e) =>
                  updateFormData("zuschlagGewerbe", e.target.value)
                }
                placeholder="z.B. 100"
              />
            </div>

            <div className="field-v2">
              <label>Zuschlag für Untervermietung (EUR)</label>
              <input
                type="number"
                className="input"
                value={formData.zuschlagUntervermietung}
                onChange={(e) =>
                  updateFormData("zuschlagUntervermietung", e.target.value)
                }
                placeholder="z.B. 80"
              />
            </div>

            <div className="field-v2">
              <label>Vorauszahlung Heizung/Warmwasser (EUR)</label>
              <input
                type="number"
                className={`input ${errors.vz_heizung ? "error" : ""}`}
                value={formData.vz_heizung}
                onChange={(e) => updateFormData("vz_heizung", e.target.value)}
                placeholder="z.B. 130"
              />
              {errors.vz_heizung && (
                <div className="error-text">{errors.vz_heizung}</div>
              )}
            </div>

            <div className="field-v2">
              <label>Vorauszahlung übrige Betriebskosten (EUR)</label>
              <input
                type="number"
                className={`input ${errors.vz_bk ? "error" : ""}`}
                value={formData.vz_bk}
                onChange={(e) =>
                  updateFormData("vz_bk", e.target.value)
                }
                placeholder="z.B. 220"
              />
              {errors.vz_bk && (
                <div className="error-text">{errors.vz_bk}</div>
              )}
            </div>

            <div className="field-v2">
              <label>Stellplatzmiete (EUR)</label>
              <input
                type="number"
                className="input"
                value={formData.stellplatzmiete}
                onChange={(e) =>
                  updateFormData("stellplatzmiete", e.target.value)
                }
                placeholder="z.B. 90"
              />
            </div>

            <div className="calculated-v2">
              <div className="summary-row">
                <span className="summary-label">Gesamtmiete / Monat</span>
                <span className="summary-value">{calculateTotalRent()}</span>
              </div>
              <small style={{ color: "#065f46" }}>
                Automatisch berechnet (schreibgeschützt)
              </small>
            </div>

            <div className="field-v2" style={{ marginTop: "16px" }}>
              <label>
                Zahlungsart <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.zahlungsart ? "error" : ""}`}
                value={formData.zahlungsart}
                onChange={(e) => updateFormData("zahlungsart", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option>Überweisung</option>
                <option>SEPA-Lastschrift</option>
              </select>
              {errors.zahlungsart && (
                <div className="error-text">{errors.zahlungsart}</div>
              )}
            </div>

            <div className="field-v2">
              <label>Zahler-IBAN (optional)</label>
              <input
                type="text"
                className="input"
                value={formData.zahlerIban}
                onChange={(e) => updateFormData("zahlerIban", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
              />
            </div>

            <div className="field-v2">
              <label>
                Betriebskostenmodell <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["vorauszahlung", "Vorauszahlung mit jährlicher Abrechnung"],
                  ["pauschale", "Pauschale"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.bk_modell === value}
                      onChange={(e) => updateFormData("bk_modell", e.target.value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.bk_modell && (
                <div className="error-text">{errors.bk_modell}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Abrechnungszeitraum <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["kalenderjahr", "01.01. – 31.12. (Kalenderjahr)"],
                  ["abweichend", "Abweichender Zeitraum"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.abrechnungszeitraum === value}
                      onChange={(e) =>
                        updateFormData("abrechnungszeitraum", e.target.value)
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.abrechnungszeitraum && (
                <div className="error-text">
                  {errors.abrechnungszeitraum}
                </div>
              )}
            </div>

            <div className="field-v2">
              <label>
                BK-Umlage über WEG <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["ja", "Ja"],
                  ["nein", "Nein"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.bkweg === value}
                      onChange={(e) => updateFormData("bkweg", e.target.value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.bkweg && <div className="error-text">{errors.bkweg}</div>}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="form-section-v2">
            <h2 className="section-title-v2">Nutzung & Tierhaltung</h2>
            <p className="tagline">Angaben zur Nutzung und Tierhaltung.</p>

            <div className="field-v2">
              <label>
                Nutzung <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["wohnen", "Nur zu Wohnzwecken"],
                  ["wohnen_gewerbe", "Wohnen + kleines Gewerbe/Home-Office"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.nutzung === value}
                      onChange={(e) => updateFormData("nutzung", e.target.value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.nutzung && <div className="error-text">{errors.nutzung}</div>}
            </div>

            <div className="field-v2">
              <label>
                Untervermietung geplant? <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["nein", "Nein"],
                  ["teilweise", "Teilweise"],
                  ["vollstaendig", "Vollständig"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.unterverm === value}
                      onChange={(e) =>
                        updateFormData("unterverm", e.target.value)
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.unterverm && (
                <div className="error-text">{errors.unterverm}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Tierhaltung <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                {[
                  ["kleintiere", "Nur Kleintiere (ohne Erlaubnis)",],
                  ["hund_katze", "Hund/Katze (mit Erlaubnis)"],
                  ["keine", "Keine (außer Kleintiere)"],
                  ["sondervereinbarung", "Sondervereinbarung"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option-v2">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.haustiere === value}
                      onChange={(e) => updateFormData("haustiere", e.target.value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.haustiere && (
                <div className="error-text">{errors.haustiere}</div>
              )}
            </div>

            {formData.haustiere === "sondervereinbarung" && (
              <div className="highlight-box">
                <label>
                  Details zur Sondervereinbarung <span className="required">*</span>
                </label>
                <textarea
                  className={`textarea ${errors.tiere_details ? "error" : ""}`}
                  rows="3"
                  value={formData.tiere_details}
                  onChange={(e) =>
                    updateFormData("tiere_details", e.target.value)
                  }
                  placeholder="Beschreiben Sie die individuelle Vereinbarung zur Tierhaltung..."
                ></textarea>
                {errors.tiere_details && (
                  <div className="error-text">{errors.tiere_details}</div>
                )}
              </div>
            )}

          </div>
        );
      case 6:
        return (
          <div className="form-section-v2">
            <h2 className="section-title-v2">Kaution & Übergabe</h2>
            <p className="tagline">Kautionshöhe, Zahlweise und Form.</p>

            <div className="field-v2">
              <label>
                Kautionshöhe (in Monatsmieten) <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.kaution ? "error" : ""}`}
                value={formData.kaution}
                onChange={(e) => updateFormData("kaution", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option value="0">Keine Kaution</option>
                <option value="1">1 Monatsmiete</option>
                <option value="2">2 Monatsmieten</option>
                <option value="3">3 Monatsmieten</option>
              </select>
              {errors.kaution && <div className="error-text">{errors.kaution}</div>}
            </div>

            <div className="field-v2">
              <label>
                Zahlweise <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.kautionZahlweise ? "error" : ""}`}
                value={formData.kautionZahlweise}
                onChange={(e) =>
                  updateFormData("kautionZahlweise", e.target.value)
                }
              >
                <option value="">Bitte wählen...</option>
                <option>Einmalig</option>
                <option>In Raten</option>
              </select>
              {errors.kautionZahlweise && (
                <div className="error-text">{errors.kautionZahlweise}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Kautionsform <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.kautionsform ? "error" : ""}`}
                value={formData.kautionsform}
                onChange={(e) => updateFormData("kautionsform", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option>Überweisung auf Treuhandkonto</option>
                <option>Barkaution</option>
                <option>Bürgschaft</option>
              </select>
              {errors.kautionsform && (
                <div className="error-text">{errors.kautionsform}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Übergabedatum <span className="required">*</span>
              </label>
              <input
                type="date"
                className={`input ${errors.uebergabedatum ? "error" : ""}`}
                value={formData.uebergabedatum}
                onChange={(e) => updateFormData("uebergabedatum", e.target.value)}
              />
              {errors.uebergabedatum && (
                <div className="error-text">{errors.uebergabedatum}</div>
              )}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="form-section-v2">
            <h2 className="section-title-v2">Zusammenfassung</h2>
            <p className="tagline">
              Bitte überprüfen Sie Ihre Angaben, bevor Sie die Daten speichern.
            </p>

            <div className="summary-section-v2">
              <div className="summary-title">Rolle & Kontakt</div>
              <div className="summary-row">
                <span className="summary-label">Rolle</span>
                <span className="summary-value">{formData.rolle || "-"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Name</span>
                <span className="summary-value">{formData.eigene_name || "-"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">E-Mail</span>
                <span className="summary-value">{formData.eigene_email || "-"}</span>
              </div>
            </div>

            <div className="summary-section-v2">
              <div className="summary-title">Mietobjekt</div>
              <div className="summary-row">
                <span className="summary-label">Adresse</span>
                <span className="summary-value">{formData.objektadresse || "-"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Wohnungsart</span>
                <span className="summary-value">{formData.wohnungsart || "-"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Wohnfläche</span>
                <span className="summary-value">{formData.wohnflaeche || "-"}</span>
              </div>
            </div>

            <div className="summary-section-v2">
              <div className="summary-title">Zustand & Schlüssel</div>
              <div className="summary-row">
                <span className="summary-label">Zustand</span>
                <span className="summary-value">{formData.zustand || "-"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Übergabeprotokoll</span>
                <span className="summary-value">
                  {formData.uebergabeprotokoll === null
                    ? "-"
                    : formData.uebergabeprotokoll
                      ? "Ja"
                      : "Nein"}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Lärm / Umgebung</span>
                <span className="summary-value">{formData.laerm || "-"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Schlüsselarten</span>
                <span className="summary-value">
                  {formData.schluessel_arten?.length
                    ? formData.schluessel_arten.join(", ")
                    : "-"}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Gesamtanzahl</span>
                <span className="summary-value">{formData.schluessel_anzahl || "-"}</span>
              </div>
            </div>

            <div className="summary-section-v2">
              <div className="summary-title">Mietzeit</div>
              <div className="summary-row">
                <span className="summary-label">Mietbeginn</span>
                <span className="summary-value">{formData.mietbeginn || "-"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Vertragsart</span>
                <span className="summary-value">{formData.vertragsart || "-"}</span>
              </div>
              {formData.vertragsart === "Befristet" && (
                <>
                  <div className="summary-row">
                    <span className="summary-label">Mietende</span>
                    <span className="summary-value">{formData.mietende || "-"}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Befristungsgrund</span>
                    <span className="summary-value">{formData.befristungsgrund || "-"}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Begründung</span>
                    <span className="summary-value">{formData.befristungsgrund_text || "-"}</span>
                  </div>
                </>
              )}
            </div>

            <div className="summary-section-v2">
              <div className="summary-title">Miete & Kosten</div>
              <div className="summary-row">
                <span className="summary-label">Grundmiete</span>
                <span className="summary-value">{formatCurrency(formData.grundmiete)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">VZ Heizung/WW</span>
                <span className="summary-value">{formatCurrency(formData.vz_heizung)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">VZ Betriebskosten</span>
                <span className="summary-value">{formatCurrency(formData.vz_bk)}</span>
              </div>
              <div className="summary-row" style={{ fontWeight: 700, color: "#065f46" }}>
                <span className="summary-label">Gesamtmiete</span>
                <span className="summary-value">{calculateTotalRent()}</span>
              </div>
            </div>

            <div className="info-box-v2" style={{ borderColor: "#10b981" }}>
              <p style={{ fontWeight: 600, color: "#065f46" }}>
                ✓ Ihre Angaben werden beim Abschluss gespeichert und an die Kanzlei übermittelt.
              </p>
            </div>

            <button
              className="btn-success-v2"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={exportJSON}
            >
              📧 Daten absenden und exportieren
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mandanten-page">
      <div className="mandanten-hero">
        <h1>Mandantenmaske</h1>
        <p>Schrittweise Erfassung aller Angaben für den Mietvertrag.</p>
        {renderStepper()}
      </div>

      <div className="form-card-v2">{renderStep()}</div>

      <div className="nav-buttons-container" style={{ marginTop: "20px" }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="btn-secondary-v2"
        >
          <ChevronLeft /> Zurück
        </button>

        {currentStep < steps.length - 1 ? (
          <button onClick={nextStep} className="btn-primary-v2">
            Weiter <ChevronRight />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**********************
 * ANWALTSMASKE (MASK B)
 **********************/
function AnwaltsMaske() {
  const [showImport, setShowImport] = useState(true);
  const [mandantendaten, setMandantendaten] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [importStatus, setImportStatus] = useState("idle");
  const [importMessage, setImportMessage] = useState(
    "Bitte laden Sie die JSON-Datei aus der Mandantenmaske."
  );
  const [downloadUrl, setDownloadUrl] = useState("");
  const [apiError, setApiError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    vertragsartFinal: "",
    kuendigungsverzichtJahre: "0",
    indexmiete557b: "",
    staffelmiete: "",
    staffelmieteSchedule: "",
    faelligkeit: "",
    mietanpassung: "",
    mpbStatus: "",
    mpbVormietverhaeltnis: "",
    mpbGrenze: "",
    mpbGrundVormiete: false,
    mpbVormieteBetrag: "",
    mpbGrundModernisierung: false,
    mpbModernisierungDetails: "",
    mpbGrundErstmiete: false,
    mpbErstmieteDetails: "",
    bkZusatzPositionen: [],
    wegVerweisSchluessel: "",
    heizwwParagraph: "",
    untervermietungKlausel: "",
    tierhaltungTon: "",
    srModell: "",
    sr_zuschuss: "",
    sr_zuschuss_betrag: "",
    sr_mietfrei: "",
    sr_mietfrei_monate: "",
    kleinrepJeVorgang: "",
    kleinrep_jahr: "",
    endrueckgabe: "",
    haftung536a: "",
    umgebung_laerm: "",
    aufrechnung: "",
    veraeusserung: "",
    energieausweisEinbindung: "",
    dsgvoBeiblatt: "",
    anlagen: [],
    bearbeiter: "",
    freigabe: "",
    // optional tenant contact (only in lawyer view)
    mieterEmail: "",
    mieterTelefon: "",
  });

  const formatCurrency = (value) => {
    const num = parseFloat(value || "0");
    if (Number.isNaN(num)) return "-";
    return `${num.toFixed(2)} EUR`;
  };

  const calculateImportedTotalRent = () => {
    if (!mandantendaten) return "-";
    const toNumber = (val) => parseFloat(val || "0") || 0;
    const total =
      toNumber(mandantendaten.grundmiete) +
      toNumber(mandantendaten.zuschlagMoebliert) +
      toNumber(mandantendaten.zuschlagGewerbe) +
      toNumber(mandantendaten.zuschlagUntervermietung) +
      toNumber(mandantendaten.vz_heizung) +
      toNumber(mandantendaten.vz_bk) +
      toNumber(mandantendaten.stellplatzmiete);

    return formatCurrency(total);
  };

  const combinedMasksDownloadHref = useMemo(() => {
    if (!mandantendaten) return null;
    const combined = { maskA: mandantendaten, maskB: formData };
    const json = JSON.stringify(combined, null, 2);
    return `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
  }, [mandantendaten, formData]);

  const renderSummaryField = (label, value, formatter) => {
    const displayValue =
      value || value === 0
        ? formatter
          ? formatter(value)
          : value
        : "-";

    return (
      <div className="summary-field">
        <span className="summary-label">{label}</span>
        <span className="summary-value">{displayValue}</span>
      </div>
    );
  };

  const steps = [
    "Mandantendaten",
    "Vertragsgestaltung",
    "Miete & BK",
    "Nutzung",
    "Instandhaltung",
    "Haftung",
    "Anlagen",
    "Zusammenfassung",
  ];

  const enforceExclusivity = (data) => {
    const next = { ...data };
    if (next.mietanpassung === "index") {
      next.indexmiete557b = "Ja";
      next.staffelmiete = "Nein";
    } else if (next.mietanpassung === "staffel") {
      next.indexmiete557b = "Nein";
      next.staffelmiete = "Ja";
    } else if (next.mietanpassung === "normalfall") {
      next.indexmiete557b = "Nein";
      next.staffelmiete = "Nein";
    } else if (!next.mietanpassung) {
      if (next.indexmiete557b === "Ja") next.mietanpassung = "index";
      else if (next.staffelmiete === "Ja") next.mietanpassung = "staffel";
      else if (
        next.indexmiete557b === "Nein" &&
        next.staffelmiete === "Nein"
      )
        next.mietanpassung = "normalfall";
    }
    return next;
  };

  const deriveContact = (maskAData = {}, fallback = {}) => {
    const role = maskAData.rolle;
    if (role === "Vermieter") {
      return {
        email: maskAData.gegenparteiEmail || fallback.mieterEmail || "",
        phone: maskAData.gegenparteiTelefon || fallback.mieterTelefon || "",
      };
    }

    if (role === "Mieter") {
      return {
        email: maskAData.eigene_email || fallback.mieterEmail || "",
        phone: maskAData.eigene_telefon || fallback.mieterTelefon || "",
      };
    }

    return {
      email:
        maskAData.gegenparteiEmail ||
        maskAData.eigene_email ||
        fallback.mieterEmail ||
        "",
      phone:
        maskAData.gegenparteiTelefon ||
        maskAData.eigene_telefon ||
        fallback.mieterTelefon ||
        "",
    };
  };

  const applyPrefill = (maskAData, importedMaskB = {}) => {
    setFormData((prev) => {
      const contact = deriveContact(maskAData, prev);
      const merged = {
        ...prev,
        ...importedMaskB,
        vertragsartFinal:
          importedMaskB.vertragsartFinal ||
          maskAData.vertragsart ||
          prev.vertragsartFinal,
        mieterEmail: contact.email,
        mieterTelefon: contact.phone,
      };
      return enforceExclusivity(merged);
    });
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportStatus("reading");
      setImportMessage("Datei wird gelesen…");
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const importedMaskA = data.maskA || data;
          const importedMaskB = data.maskB || {};

          setMandantendaten(importedMaskA);
          setShowImport(false);
          applyPrefill(importedMaskA, importedMaskB);
          setImportStatus("done");
          setImportMessage("Mandantendaten erfolgreich geladen.");
        } catch (error) {
          alert(
            "Fehler beim Laden der JSON-Datei. Bitte überprüfen Sie das Format."
          );
          setImportStatus("error");
          setImportMessage("Import fehlgeschlagen – bitte erneut versuchen.");
        }
      };
      reader.readAsText(file);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => enforceExclusivity({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const clone = { ...prev };
        delete clone[field];
        return clone;
      });
    }
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      const nextValues = exists
        ? current.filter((item) => item !== value)
        : [...current, value];
      return enforceExclusivity({ ...prev, [field]: nextValues });
    });
    if (errors[field]) {
      setErrors((prev) => {
        const clone = { ...prev };
        delete clone[field];
        return clone;
      });
    }
  };

  const buildStepErrors = (step) => {
    const stepErrors = {};

    if (step === 1) {
      if (!formData.vertragsartFinal)
        stepErrors.vertragsartFinal = "Bitte wählen Sie die Vertragsart.";
    }

    if (step === 2) {
      if (!formData.mietanpassung)
        stepErrors.mietanpassung = "Bitte wählen Sie die Mietanpassung.";
      if (
        formData.mietanpassung === "staffel" &&
        !formData.staffelmieteSchedule
      )
        stepErrors.staffelmieteSchedule =
          "Bitte tragen Sie den Staffelmiete-Zeitplan ein.";
    }

    if (step === 3) {
      if (!formData.untervermietungKlausel)
        stepErrors.untervermietungKlausel =
          "Bitte wählen Sie eine Regelung zur Untervermietung.";
      if (!formData.tierhaltungTon)
        stepErrors.tierhaltungTon =
          "Bitte wählen Sie den Klauselton zur Tierhaltung.";
    }

    if (step === 4) {
      if (!formData.srModell)
        stepErrors.srModell = "Bitte wählen Sie ein SR-Modell.";
      if (!formData.kleinrepJeVorgang)
        stepErrors.kleinrepJeVorgang =
          "Bitte wählen Sie die Kleinreparatur-Grenze je Vorgang.";
      if (!formData.kleinrep_jahr)
        stepErrors.kleinrep_jahr =
          "Bitte wählen Sie die Jahresobergrenze für Kleinreparaturen.";
      if (!formData.endrueckgabe)
        stepErrors.endrueckgabe =
          "Bitte wählen Sie die Regelung zur Endrückgabe.";
      if (!formData.sr_zuschuss)
        stepErrors.sr_zuschuss = "Bitte wählen Sie die SR-Zuschussregel.";
      if (formData.sr_zuschuss === "ja" && !formData.sr_zuschuss_betrag)
        stepErrors.sr_zuschuss_betrag =
          "Bitte geben Sie den Zuschussbetrag an.";
      if (!formData.sr_mietfrei)
        stepErrors.sr_mietfrei = "Bitte wählen Sie die Mietfrei-Option.";
      if (formData.sr_mietfrei === "ja" && !formData.sr_mietfrei_monate)
        stepErrors.sr_mietfrei_monate =
          "Bitte geben Sie die Anzahl der Monate an.";
    }

    if (step === 5) {
      if (!formData.haftung536a)
        stepErrors.haftung536a = "Bitte wählen Sie die Haftungsregel.";
      if (!formData.umgebung_laerm)
        stepErrors.umgebung_laerm = "Bitte wählen Sie die Option zu Umgebungslärm.";
      if (!formData.aufrechnung)
        stepErrors.aufrechnung = "Bitte treffen Sie eine Aufrechnungsregel.";
      if (!formData.veraeusserung)
        stepErrors.veraeusserung = "Bitte wählen Sie die Veräußerungsregel.";
    }

    if (step === 6) {
      if (!formData.energieausweisEinbindung)
        stepErrors.energieausweisEinbindung =
          "Bitte wählen Sie die Option zum Energieausweis.";
      if (!formData.dsgvoBeiblatt)
        stepErrors.dsgvoBeiblatt = "Bitte wählen Sie die DSGVO-Angabe.";
      if (!formData.bearbeiter)
        stepErrors.bearbeiter = "Bitte tragen Sie den Bearbeiter ein.";
      if (!formData.freigabe)
        stepErrors.freigabe = "Bitte wählen Sie die Freigabe.";
      if (!formData.anlagen?.length)
        stepErrors.anlagen = "Bitte wählen Sie die Anlagen aus.";
    }

    return stepErrors;
  };

  const validateStep = (step) => {
    const stepErrors = buildStepErrors(step);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateAll = () => {
    const combined = {};
    steps.forEach((_, idx) => {
      Object.assign(combined, buildStepErrors(idx));
    });
    setErrors(combined);
    return Object.keys(combined).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) =>
        Math.min(prev + 1, steps.length - 1)
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportFinalJSON = async () => {
    if (!mandantendaten) {
      alert("Es wurden keine Mandantendaten geladen.");
      return;
    }

    if (!validateAll()) {
      return;
    }

    setApiError("");
    setDownloadUrl("");
    setIsGenerating(true);
    // backend still only needs maskA + maskB; extra fields are ignored
    try {
      const res = await fetch(`${API_BASE}/generate_contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maskA: mandantendaten,
          maskB: formData,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Fehler bei der Vertragserstellung:",
          text
        );
        setApiError(
          "Der Vertrag konnte nicht erstellt werden. Bitte später erneut versuchen."
        );
        setIsGenerating(false);
        alert(
          "Der Vertrag konnte nicht erstellt werden. Bitte später erneut versuchen."
        );
        return;
      }

      const data = await res.json();
      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      } else {
        setApiError(
          "Die Antwort des Servers enthält keinen Download-Link."
        );
      }
    } catch (e) {
      console.error(
        "Fehler bei der Kommunikation mit Azure:",
        e
      );
      setApiError(
        "Es ist ein Verbindungsfehler aufgetreten. Bitte prüfen Sie die Server-Konfiguration."
      );
    }
    setIsGenerating(false);
  };

  const renderStep = () => {
    const mietanpassungLabels = {
      normalfall: "Normalfall (§ 558 BGB)",
      index: "Indexmiete (§ 557b BGB)",
      staffel: "Staffelmiete",
    };

    const mpbStatusLabels = {
      neubau: "Neubau (nie zuvor vermietet)",
      bereits_vermietet: "Bereits vermietet",
    };

    const mpbVormietLabels = {
      vor_juni_2015: "VOR 01.06.2015",
      nach_juni_2015: "NACH 01.06.2015",
    };

    const mpbGrenzeLabels = {
      ja: "Ja, unter der Grenze",
      nein: "Nein, über der Grenze",
    };

    const heizwwLabels = {
      ja: "Ja - separater § für Heiz-/Warmwasserkosten",
      nein: "Nein - zusammen mit BK",
    };

    switch (currentStep) {
      case 0:
        if (showImport) {
          return (
            <div>
              <h2 className="section-title">Datensatz übernehmen</h2>
              <div className="import-section">
                <div className="upload-zone">
                  <div className="upload-icon">
                    <UploadIcon />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      color: "#6b21a8",
                    }}
                  >
                    JSON-Datei der Mandantenmaske hochladen
                  </h3>
                  <p className="help-text" style={{ marginBottom: "1rem" }}>
                    Laden Sie die JSON-Datei hoch, die aus der Mandantenmaske
                    exportiert wurde. Die Kontakt- und Vertragsdaten werden
                    automatisch übernommen.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    style={{ display: "none" }}
                    id="json-upload"
                  />
                  <label
                    htmlFor="json-upload"
                    className="button button-primary"
                    style={{ background: "#7c3aed" }}
                  >
                    Datei auswählen
                  </label>

                  <div style={{ marginTop: "1rem" }}>
                    <span
                      className={`status-pill ${importStatus === "done"
                        ? "success"
                        : importStatus === "error"
                          ? "error"
                          : "info"
                        }`}
                    >
                      {importMessage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2
                className="section-title"
                style={{ marginBottom: 0 }}
              >
                Mandantendaten (Read-Only)
              </h2>
              <span
                className={`status-pill ${importStatus === "done" ? "success" : "info"
                  }`}
              >
                {importMessage}
              </span>
              <button
                onClick={() => setShowImport(true)}
                style={{
                  fontSize: "0.875rem",
                  color: "#7c3aed",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Andere Datei laden
              </button>
            </div>

            <div className="alert alert-info">
              Diese Daten stammen aus der Mandantenmaske und
              können hier nicht bearbeitet werden.
            </div>

            <div className="summary-section">
              <div className="summary-title">Rolle & Kontakt</div>
              {renderSummaryField("Rolle", mandantendaten?.rolle)}
              {renderSummaryField("Name / Firma", mandantendaten?.eigene_name)}
              {renderSummaryField("E-Mail", mandantendaten?.eigene_email)}
              {renderSummaryField("Telefon", mandantendaten?.eigene_telefon)}
            </div>

            <div className="summary-section">
              <div className="summary-title">Objektangaben</div>
              {renderSummaryField("Objektadresse", mandantendaten?.objektadresse)}
              {renderSummaryField(
                "Wohneinheit",
                mandantendaten?.wohnungsart || mandantendaten?.wohnung_bez
              )}
              {renderSummaryField(
                "Heizkosten (EUR)",
                mandantendaten?.vz_heizung,
                formatCurrency
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">Mietzeit</div>
              {renderSummaryField("Mietbeginn", mandantendaten?.mietbeginn)}
              {renderSummaryField(
                "Bezugsfertig seit",
                mandantendaten?.bezugsfertig
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">Miete</div>
              {renderSummaryField(
                "Grundmiete (EUR)",
                mandantendaten?.grundmiete,
                formatCurrency
              )}
              {renderSummaryField(
                "Gesamtmiete (EUR)",
                mandantendaten && calculateImportedTotalRent()
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="section-title">
              Vertragsgestaltung
            </h2>

            <div className="form-group">
              <label className="label">
                Vertragsart final{" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="unbefristet"
                    checked={
                      formData.vertragsartFinal === "unbefristet"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "vertragsartFinal",
                        e.target.value
                      )
                    }
                  />
                  Unbefristet
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="befristet"
                    checked={
                      formData.vertragsartFinal === "befristet"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "vertragsartFinal",
                        e.target.value
                      )
                    }
                  />
                  Befristet (mit § 575-Grund aus Mandantendaten)
                </label>
              </div>
              {errors.vertragsartFinal && (
                <div className="error-text">{errors.vertragsartFinal}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Kündigungsverzicht (Jahre)
              </label>
              <input
                type="number"
                className="input"
                min="0"
                value={formData.kuendigungsverzichtJahre}
                onChange={(e) =>
                  updateFormData(
                    "kuendigungsverzichtJahre",
                    e.target.value
                  )
                }
              />
              <div className="help-text">
                0 = kein Verzicht
              </div>
            </div>
          </div>
        );

      case 2: {
        const showMietpreisbremse = (() => {
          if (!mandantendaten?.bezugsfertig) return false;
          const parsedDate = new Date(mandantendaten.bezugsfertig);
          if (Number.isNaN(parsedDate.getTime())) return false;
          return parsedDate < new Date("2014-10-01");
        })();

        const showMpbStufe2 = formData.mpbStatus === "bereits_vermietet";
        const showMpbStufe4 = formData.mpbGrenze === "nein";

        return (
          <div className="form-section-v2">
            <h2 className="section-title">Miethöhe & Betriebskosten</h2>

            <div className="field-v2">
              <label>
                Mietanpassung <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                <label className="radio-option-v2">
                  <input
                    type="radio"
                    name="mietanpassung"
                    value="normalfall"
                    checked={formData.mietanpassung === "normalfall"}
                    onChange={(e) =>
                      updateFormData("mietanpassung", e.target.value)
                    }
                  />
                  <span>Normalfall (Gesetzliche Regelungen § 558 BGB)</span>
                </label>
                <label className="radio-option-v2">
                  <input
                    type="radio"
                    name="mietanpassung"
                    value="index"
                    checked={formData.mietanpassung === "index"}
                    onChange={(e) =>
                      updateFormData("mietanpassung", e.target.value)
                    }
                  />
                  <span>Indexmiete (§ 557b BGB)</span>
                </label>
                <label className="radio-option-v2">
                  <input
                    type="radio"
                    name="mietanpassung"
                    value="staffel"
                    checked={formData.mietanpassung === "staffel"}
                    onChange={(e) =>
                      updateFormData("mietanpassung", e.target.value)
                    }
                  />
                  <span>Staffelmiete</span>
                </label>
              </div>
              <p className="help-text">
                Indexmiete und Staffelmiete schließen sich gegenseitig aus
              </p>
              {errors.mietanpassung && (
                <div className="error-text">{errors.mietanpassung}</div>
              )}
            </div>

            {formData.mietanpassung === "staffel" && (
              <div className="field-v2">
                <label>
                  Staffelmiete - Zeitplan <span className="required">*</span>
                </label>
                <textarea
                  className={`textarea ${errors.staffelmieteSchedule ? "error" : ""}`}
                  rows="3"
                  placeholder="z.B. ab 01.01.2025 +50 EUR; ab 01.01.2026 +50 EUR"
                  value={formData.staffelmieteSchedule}
                  onChange={(e) =>
                    updateFormData("staffelmieteSchedule", e.target.value)
                  }
                ></textarea>
                {errors.staffelmieteSchedule && (
                  <div className="error-text">{errors.staffelmieteSchedule}</div>
                )}
              </div>
            )}

            {showMietpreisbremse && (
              <div
                style={{
                  background: "#fef2f2",
                  padding: "20px",
                  borderRadius: "8px",
                  borderLeft: "4px solid #dc2626",
                  margin: "20px 0",
                }}
              >
                <h3 style={{ color: "#991b1b", marginBottom: "15px" }}>
                  ⚠️ Mietpreisbremsen-Prüfung
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#7f1d1d",
                    marginBottom: "20px",
                  }}
                >
                  Das Objekt wurde vor dem 01.10.2014 bezugsfertig. Bitte
                  prüfen Sie die Mietpreisbremse.
                </p>

                <div className="field-v2">
                  <label>
                    Stufe 1: Status der Wohnung <span className="required">*</span>
                  </label>
                  <div className="radio-group-v2">
                    <label className="radio-option-v2">
                      <input
                        type="radio"
                        name="mpb_status"
                        value="neubau"
                        checked={formData.mpbStatus === "neubau"}
                        onChange={(e) =>
                          updateFormData("mpbStatus", e.target.value)
                        }
                      />
                      <span>Neubau (nie zuvor vermietet)</span>
                    </label>
                    <label className="radio-option-v2">
                      <input
                        type="radio"
                        name="mpb_status"
                        value="bereits_vermietet"
                        checked={
                          formData.mpbStatus === "bereits_vermietet"
                        }
                        onChange={(e) =>
                          updateFormData("mpbStatus", e.target.value)
                        }
                      />
                      <span>Bereits vermietet</span>
                    </label>
                  </div>
                </div>

                {showMpbStufe2 && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "15px",
                      background: "white",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="field-v2">
                      <label>
                        Stufe 2: Vormietverhältnis begann... <span className="required">*</span>
                      </label>
                      <div className="radio-group-v2">
                        <label className="radio-option-v2">
                          <input
                            type="radio"
                            name="mpb_vormiet"
                            value="vor_juni_2015"
                            checked={
                              formData.mpbVormietverhaeltnis ===
                              "vor_juni_2015"
                            }
                            onChange={(e) =>
                              updateFormData(
                                "mpbVormietverhaeltnis",
                                e.target.value
                              )
                            }
                          />
                          <span>VOR 01.06.2015</span>
                        </label>
                        <label className="radio-option-v2">
                          <input
                            type="radio"
                            name="mpb_vormiet"
                            value="nach_juni_2015"
                            checked={
                              formData.mpbVormietverhaeltnis ===
                              "nach_juni_2015"
                            }
                            onChange={(e) =>
                              updateFormData(
                                "mpbVormietverhaeltnis",
                                e.target.value
                              )
                            }
                          />
                          <span>NACH 01.06.2015</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "white",
                    borderRadius: "8px",
                  }}
                >
                  <div className="field-v2">
                    <label>
                      Stufe 3: Liegt die Miete innerhalb der Mietpreisbremse?{' '}
                      <span className="required">*</span>
                    </label>
                    <div className="radio-group-v2">
                      <label className="radio-option-v2">
                        <input
                          type="radio"
                          name="mpb_grenze"
                          value="ja"
                          checked={formData.mpbGrenze === "ja"}
                          onChange={(e) =>
                            updateFormData("mpbGrenze", e.target.value)
                          }
                        />
                        <span>
                          Ja, unter der Grenze (max. 110% ortsübliche Vergleichsmiete)
                        </span>
                      </label>
                      <label className="radio-option-v2">
                        <input
                          type="radio"
                          name="mpb_grenze"
                          value="nein"
                          checked={formData.mpbGrenze === "nein"}
                          onChange={(e) =>
                            updateFormData("mpbGrenze", e.target.value)
                          }
                        />
                        <span>Nein, über der Grenze</span>
                      </label>
                    </div>
                  </div>
                </div>

                {showMpbStufe4 && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "15px",
                      background: "#fef3c7",
                      borderRadius: "8px",
                    }}
                  >
                    <h4 style={{ color: "#92400e", marginBottom: "10px" }}>
                      Stufe 4: Begründung für Überschreitung
                    </h4>

                    <div className="field-v2">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="mpb_grund_vormiete"
                          checked={!!formData.mpbGrundVormiete}
                          onChange={(e) =>
                            updateFormData("mpbGrundVormiete", e.target.checked)
                          }
                        />
                        <span>Vormiete war höher</span>
                      </label>
                    </div>

                    <div className="field-v2" style={{ marginLeft: "25px" }}>
                      <label>Vormiete (EUR/Monat)</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="z.B. 1650"
                        value={formData.mpbVormieteBetrag}
                        onChange={(e) =>
                          updateFormData("mpbVormieteBetrag", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-v2">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="mpb_grund_modernisierung"
                          checked={!!formData.mpbGrundModernisierung}
                          onChange={(e) =>
                            updateFormData(
                              "mpbGrundModernisierung",
                              e.target.checked
                            )
                          }
                        />
                        <span>Modernisierung durchgeführt</span>
                      </label>
                    </div>

                    <div className="field-v2" style={{ marginLeft: "25px" }}>
                      <label>Details zur Modernisierung</label>
                      <textarea
                        rows="3"
                        className="textarea"
                        placeholder="Beschreibung der Modernisierungsmaßnahmen und Kosten..."
                        value={formData.mpbModernisierungDetails}
                        onChange={(e) =>
                          updateFormData(
                            "mpbModernisierungDetails",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field-v2">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="mpb_grund_erstmiete"
                          checked={!!formData.mpbGrundErstmiete}
                          onChange={(e) =>
                            updateFormData(
                              "mpbGrundErstmiete",
                              e.target.checked
                            )
                          }
                        />
                        <span>Erstmiete nach umfassender Modernisierung</span>
                      </label>
                    </div>

                    <div className="field-v2" style={{ marginLeft: "25px" }}>
                      <label>Details zur Erstmiete</label>
                      <textarea
                        rows="3"
                        className="textarea"
                        placeholder="Datum und Umfang der Modernisierung..."
                        value={formData.mpbErstmieteDetails}
                        onChange={(e) =>
                          updateFormData("mpbErstmieteDetails", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="field-v2">
              <label>
                Fälligkeit / Mahnsystem <span className="required">*</span>
              </label>
              <select
                className="select"
                value={formData.faelligkeit}
                onChange={(e) => updateFormData("faelligkeit", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option value="spätestens 3. Werktag des Monats">
                  Spätestens 3. Werktag des Monats
                </option>
                <option value="abweichende Regelung">Abweichende Regelung</option>
              </select>
            </div>

            <div className="field-v2">
              <label>Zusatz-BK-Positionen</label>
              <div className="checkbox-group-v2">
                {["Objektschutz", "Dachrinnenreinigung", "Beleuchtung allgemeiner Flächen", "Wartung technischer Anlagen", "Gartenpflege", "Hausmeister"].map(
                  (option) => (
                    <label key={option} className="checkbox-option-v2">
                      <input
                        type="checkbox"
                        checked={formData.bkZusatzPositionen.includes(option)}
                        onChange={() =>
                          toggleArrayValue("bkZusatzPositionen", option)
                        }
                      />
                      <span>{option}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="field-v2">
              <label>WEG-Verweis / Schlüssel (nur bei ETW)</label>
              <textarea
                className="textarea"
                placeholder="z.B. Teilungserklärung § ...; MEA lt. Mandantendaten"
                rows="2"
                value={formData.wegVerweisSchluessel}
                onChange={(e) =>
                  updateFormData("wegVerweisSchluessel", e.target.value)
                }
              />
            </div>

            <div className="field-v2">
              <label>
                Heiz-/WW als eigener Paragraph? <span className="required">*</span>
              </label>
              <div className="radio-group-v2">
                <label className="radio-option-v2">
                  <input
                    type="radio"
                    name="heizww"
                    value="ja"
                    checked={formData.heizwwParagraph === "ja"}
                    onChange={(e) =>
                      updateFormData("heizwwParagraph", e.target.value)
                    }
                  />
                  <span>Ja - separater § für Heiz-/Warmwasserkosten</span>
                </label>
                <label className="radio-option-v2">
                  <input
                    type="radio"
                    name="heizww"
                    value="nein"
                    checked={formData.heizwwParagraph === "nein"}
                    onChange={(e) =>
                      updateFormData("heizwwParagraph", e.target.value)
                    }
                  />
                  <span>Nein - zusammen mit BK</span>
                </label>
              </div>
            </div>
          </div>
        );
      }

      case 3:
        return (
          <div>
            <h2 className="section-title">
              Nutzung & Nebenpflichten
            </h2>

            <div className="form-group">
              <label className="label">
                Untervermietung - Klauselart{" "}
                <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.untervermietungKlausel ? "error" : ""}`}
                value={formData.untervermietungKlausel}
                onChange={(e) =>
                  updateFormData(
                    "untervermietungKlausel",
                    e.target.value
                  )
                }
              >
                <option value="">Bitte wählen...</option>
                <option value="Zustimmung + Sicherungsabtretung">
                  Zustimmung + Sicherungsabtretung
                </option>
                <option value="nur Zustimmung">
                  Nur Zustimmung
                </option>
                <option value="individuell">
                  Individuelle Regelung
                </option>
              </select>
              {errors.untervermietungKlausel && (
                <div className="error-text">{errors.untervermietungKlausel}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Tierhaltung - Klauselton{" "}
                <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.tierhaltungTon ? "error" : ""}`}
                value={formData.tierhaltungTon}
                onChange={(e) =>
                  updateFormData(
                    "tierhaltungTon",
                    e.target.value
                  )
                }
              >
                <option value="">Bitte wählen...</option>
                <option value="Standard">
                  Standard (Kleintiere frei, Hunde/Katzen mit
                  Erlaubnis)
                </option>
                <option value="restriktiver">
                  Restriktiver
                </option>
                <option value="individuell">
                  Individuell
                </option>
              </select>
              {errors.tierhaltungTon && (
                <div className="error-text">{errors.tierhaltungTon}</div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="section-title">
              Instandhaltung / SR / Kleinreparaturen
            </h2>

            <div className="alert alert-warning">
              <strong>
                ⚠️ Achtung: Schönheitsreparaturen mit Fristen
                sind oft unwirksam!
              </strong>
            </div>

            <div className="form-group">
              <label className="label">
                Schönheitsreparaturen{" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Pauschal (ohne Fristen)"
                    checked={
                      formData.srModell ===
                      "Pauschal (ohne Fristen)"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "srModell",
                        e.target.value
                      )
                    }
                  />
                  Pauschal (ohne Fristen) - sicherer
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Fristenplan 5/7/10"
                    checked={
                      formData.srModell ===
                      "Fristenplan 5/7/10"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "srModell",
                        e.target.value
                      )
                    }
                  />
                  Fristenplan 5/7/10 Jahre (Risiko!)
                </label>
              </div>
              {errors.srModell && (
                <div className="error-text">{errors.srModell}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                SR-Zuschuss / Mietabsenkung <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="ja"
                    checked={formData.sr_zuschuss === "ja"}
                    onChange={(e) => updateFormData("sr_zuschuss", e.target.value)}
                  />
                  Ja, Zuschuss vereinbart
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="nein"
                    checked={formData.sr_zuschuss === "nein"}
                    onChange={(e) => updateFormData("sr_zuschuss", e.target.value)}
                  />
                  Nein
                </label>
              </div>
              {errors.sr_zuschuss && (
                <div className="error-text">{errors.sr_zuschuss}</div>
              )}
              {formData.sr_zuschuss === "ja" && (
                <div className="field-v2" style={{ marginTop: "10px" }}>
                  <label>
                    Zuschussbetrag (EUR) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={`input ${errors.sr_zuschuss_betrag ? "error" : ""}`}
                    value={formData.sr_zuschuss_betrag}
                    onChange={(e) =>
                      updateFormData("sr_zuschuss_betrag", e.target.value)
                    }
                  />
                  {errors.sr_zuschuss_betrag && (
                    <div className="error-text">{errors.sr_zuschuss_betrag}</div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Mietfreie Zeit statt SR <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="ja"
                    checked={formData.sr_mietfrei === "ja"}
                    onChange={(e) => updateFormData("sr_mietfrei", e.target.value)}
                  />
                  Ja
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="nein"
                    checked={formData.sr_mietfrei === "nein"}
                    onChange={(e) => updateFormData("sr_mietfrei", e.target.value)}
                  />
                  Nein
                </label>
              </div>
              {errors.sr_mietfrei && (
                <div className="error-text">{errors.sr_mietfrei}</div>
              )}
              {formData.sr_mietfrei === "ja" && (
                <div className="field-v2" style={{ marginTop: "10px" }}>
                  <label>
                    Mietfreie Monate <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={`input ${errors.sr_mietfrei_monate ? "error" : ""}`}
                    value={formData.sr_mietfrei_monate}
                    onChange={(e) =>
                      updateFormData("sr_mietfrei_monate", e.target.value)
                    }
                  />
                  {errors.sr_mietfrei_monate && (
                    <div className="error-text">{errors.sr_mietfrei_monate}</div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Kleinreparaturen - je Vorgang{" "}
                <span className="required">*</span>
              </label>
              <select
                className="select"
                value={formData.kleinrepJeVorgang}
                onChange={(e) =>
                  updateFormData(
                    "kleinrepJeVorgang",
                    e.target.value
                  )
                }
              >
                <option value="">Bitte wählen...</option>
                <option value="100">100 EUR</option>
                <option value="110">110 EUR</option>
                <option value="120">120 EUR</option>
              </select>
              {errors.kleinrepJeVorgang && (
                <div className="error-text">{errors.kleinrepJeVorgang}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Kleinreparaturen - Jahresobergrenze <span className="required">*</span>
              </label>
              <select
                className="select"
                value={formData.kleinrep_jahr}
                onChange={(e) => updateFormData("kleinrep_jahr", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option value="6fach">6-fache Einzelfallgrenze</option>
                <option value="8fach">8-fache Einzelfallgrenze</option>
                <option value="individuell">Individuell</option>
              </select>
              {errors.kleinrep_jahr && (
                <div className="error-text">{errors.kleinrep_jahr}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Endrückgabe <span className="required">*</span>
              </label>
              <select
                className="select"
                value={formData.endrueckgabe}
                onChange={(e) => updateFormData("endrueckgabe", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option value="besenrein">Besenrein / gereinigt</option>
                <option value="wie_uebernommen">Wie übernommen</option>
                <option value="individuell">Individuelle Vereinbarung</option>
              </select>
              {errors.endrueckgabe && (
                <div className="error-text">{errors.endrueckgabe}</div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="section-title">
              Haftung & Sonstiges
            </h2>

            <div className="form-group">
              <label className="label">
                Haftung Vermieter (§ 536a){" "}
                <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.haftung536a ? "error" : ""}`}
                value={formData.haftung536a}
                onChange={(e) =>
                  updateFormData(
                    "haftung536a",
                    e.target.value
                  )
                }
              >
                <option value="">Bitte wählen...</option>
                <option value="Ausschluss (außer Leben/Körper/Gesundheit)">
                  Ausschluss (außer
                  Leben/Körper/Gesundheit)
                </option>
                <option value="generisch">
                  Generische Regelung
                </option>
                <option value="individuell">
                Individuell
              </option>
              </select>
              {errors.haftung536a && (
                <div className="error-text">{errors.haftung536a}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Umgebung / Lärm <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.umgebung_laerm ? "error" : ""}`}
                value={formData.umgebung_laerm}
                onChange={(e) => updateFormData("umgebung_laerm", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option value="hinweis">Hinweis auf Lärmquellen aufnehmen</option>
                <option value="keine">Keine besonderen Hinweise</option>
                <option value="individuell">Individuell</option>
              </select>
              {errors.umgebung_laerm && (
                <div className="error-text">{errors.umgebung_laerm}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Aufrechnung <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="nur_unbestritten"
                    checked={formData.aufrechnung === "nur_unbestritten"}
                    onChange={(e) => updateFormData("aufrechnung", e.target.value)}
                  />
                  Nur mit unbestrittenen/ rechtskräftigen Forderungen
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="erweitert"
                    checked={formData.aufrechnung === "erweitert"}
                    onChange={(e) => updateFormData("aufrechnung", e.target.value)}
                  />
                  Erweiterte Aufrechnung möglich
                </label>
              </div>
              {errors.aufrechnung && (
                <div className="error-text">{errors.aufrechnung}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Veräußerung während Mietzeit <span className="required">*</span>
              </label>
              <select
                className={`select ${errors.veraeusserung ? "error" : ""}`}
                value={formData.veraeusserung}
                onChange={(e) => updateFormData("veraeusserung", e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option value="kuendigungsausschluss">Kündigungsausschluss vereinbaren</option>
                <option value="weitergabe">Vertrag geht über (§ 566 BGB)</option>
                <option value="individuell">Individuelle Regelung</option>
              </select>
              {errors.veraeusserung && (
                <div className="error-text">{errors.veraeusserung}</div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="section-title">
              Anlagen & Prüfung
            </h2>

            <div className="form-group">
              <label className="label">
                Anlagen <span className="required">*</span>
              </label>
              <div className="checkbox-group-v2">
                {["Energieausweis", "Hausordnung", "Übergabeprotokoll", "WEG-Unterlagen", "Sonstige Anlagen"].map(
                  (option) => (
                    <label key={option} className="checkbox-option-v2">
                      <input
                        type="checkbox"
                        checked={formData.anlagen.includes(option)}
                        onChange={() => toggleArrayValue("anlagen", option)}
                      />
                      <span>{option}</span>
                    </label>
                  )
                )}
              </div>
              {errors.anlagen && (
                <div className="error-text">{errors.anlagen}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Energieausweis{" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="informativ"
                    checked={
                      formData.energieausweisEinbindung ===
                      "informativ"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "energieausweisEinbindung",
                        e.target.value
                      )
                    }
                  />
                  Nur informativ
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Kenntnisnahme verpflichtend"
                    checked={
                      formData.energieausweisEinbindung ===
                      "Kenntnisnahme verpflichtend"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "energieausweisEinbindung",
                        e.target.value
                      )
                    }
                  />
                  Kenntnisnahme verpflichtend
                </label>
              </div>
              {errors.energieausweisEinbindung && (
                <div className="error-text">
                  {errors.energieausweisEinbindung}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                DSGVO-Informationsblatt{" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Ja"
                    checked={formData.dsgvoBeiblatt === "Ja"}
                    onChange={(e) =>
                      updateFormData(
                        "dsgvoBeiblatt",
                        e.target.value
                      )
                    }
                  />
                  Ja - beilegen
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Nein"
                    checked={formData.dsgvoBeiblatt === "Nein"}
                    onChange={(e) =>
                      updateFormData(
                        "dsgvoBeiblatt",
                        e.target.value
                      )
                    }
                  />
                  Nein
                </label>
              </div>
              {errors.dsgvoBeiblatt && (
                <div className="error-text">{errors.dsgvoBeiblatt}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Bearbeiter{" "}
                <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.bearbeiter ? "error" : ""}`}
                value={formData.bearbeiter}
                onChange={(e) =>
                  updateFormData(
                    "bearbeiter",
                    e.target.value
                  )
                }
                placeholder="z.B. RAin Dr. Müller"
              />
              {errors.bearbeiter && (
                <div className="error-text">{errors.bearbeiter}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Freigabe{" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Ja"
                    checked={formData.freigabe === "Ja"}
                    onChange={(e) =>
                      updateFormData(
                        "freigabe",
                        e.target.value
                      )
                    }
                  />
                  Ja - zur Vertragserstellung freigegeben
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Nein"
                    checked={formData.freigabe === "Nein"}
                    onChange={(e) =>
                    updateFormData(
                      "freigabe",
                      e.target.value
                    )
                  }
                />
                Nein - noch Rückfragen
              </label>
              </div>
              {errors.freigabe && (
                <div className="error-text">{errors.freigabe}</div>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                Optionale Kontaktdaten Mieter (nur intern)
              </label>
              <input
                type="text"
                className="input"
                placeholder="Mieter-E-Mail (optional)"
                value={formData.mieterEmail}
                onChange={(e) =>
                  updateFormData(
                    "mieterEmail",
                    e.target.value
                  )
                }
                style={{ marginBottom: "0.5rem" }}
              />
              <input
                type="text"
                className="input"
                placeholder="Mieter-Telefon (optional)"
                value={formData.mieterTelefon}
                onChange={(e) =>
                  updateFormData(
                    "mieterTelefon",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 className="section-title">Zusammenfassung</h2>

            <div className="alert alert-info">
              <strong>Finalisierung:</strong> Alle juristischen
              Entscheidungen sind getroffen. Sie können nun die
              Vertragserstellung auslösen.
            </div>

            <div className="summary-section">
              <div className="summary-title">
                Vertragsgestaltung
              </div>
              {formData.vertragsartFinal && (
                <div className="summary-field">
                  <span className="summary-label">
                    Vertragsart:
                  </span>
                  <span className="summary-value">
                    {formData.vertragsartFinal}
                  </span>
                </div>
              )}
              {formData.kuendigungsverzichtJahre && (
                <div className="summary-field">
                  <span className="summary-label">
                    Kündigungsverzicht (Jahre):
                  </span>
                  <span className="summary-value">
                    {formData.kuendigungsverzichtJahre}
                  </span>
                </div>
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">
                Miethöhe & BK
              </div>
              {formData.mietanpassung && (
                <div className="summary-field">
                  <span className="summary-label">
                    Mietanpassung:
                  </span>
                  <span className="summary-value">
                    {mietanpassungLabels[formData.mietanpassung] ||
                      formData.mietanpassung}
                  </span>
                </div>
              )}
              {formData.faelligkeit && (
                <div className="summary-field">
                  <span className="summary-label">
                    Fälligkeit:
                  </span>
                  <span className="summary-value">
                    {formData.faelligkeit}
                  </span>
                </div>
              )}
              {formData.mietanpassung === "staffel" &&
                formData.staffelmieteSchedule && (
                  <div className="summary-field">
                    <span className="summary-label">Staffelmietplan:</span>
                    <span className="summary-value">
                      {formData.staffelmieteSchedule}
                    </span>
                  </div>
                )}
              {formData.mpbStatus && (
                <div className="summary-field">
                  <span className="summary-label">
                    Mietpreisbremse - Status:
                  </span>
                  <span className="summary-value">
                    {mpbStatusLabels[formData.mpbStatus] ||
                      formData.mpbStatus}
                  </span>
                </div>
              )}
              {formData.mpbStatus === "bereits_vermietet" &&
                formData.mpbVormietverhaeltnis && (
                  <div className="summary-field">
                    <span className="summary-label">
                      Mietpreisbremse - Vormietverhältnis:
                    </span>
                    <span className="summary-value">
                      {mpbVormietLabels[formData.mpbVormietverhaeltnis] ||
                        formData.mpbVormietverhaeltnis}
                    </span>
                  </div>
                )}
              {formData.mpbGrenze && (
                <div className="summary-field">
                  <span className="summary-label">
                    Mietpreisbremse - Ergebnis:
                  </span>
                  <span className="summary-value">
                    {mpbGrenzeLabels[formData.mpbGrenze] || formData.mpbGrenze}
                  </span>
                </div>
              )}
              {formData.mpbGrenze === "nein" && formData.mpbGrundVormiete && (
                <div className="summary-field">
                  <span className="summary-label">Begründung: Vormiete</span>
                  <span className="summary-value">
                    Vormiete war höher
                    {formData.mpbVormieteBetrag
                      ? ` (${formData.mpbVormieteBetrag} EUR/Monat)`
                      : ""}
                  </span>
                </div>
              )}
              {formData.mpbGrenze === "nein" && formData.mpbGrundModernisierung && (
                <div className="summary-field">
                  <span className="summary-label">Begründung: Modernisierung</span>
                  <span className="summary-value">
                    {formData.mpbModernisierungDetails || "Modernisierung durchgeführt"}
                  </span>
                </div>
              )}
              {formData.mpbGrenze === "nein" && formData.mpbGrundErstmiete && (
                <div className="summary-field">
                  <span className="summary-label">Begründung: Erstmiete</span>
                  <span className="summary-value">
                    {formData.mpbErstmieteDetails ||
                      "Erstmiete nach umfassender Modernisierung"}
                  </span>
                </div>
              )}
              {formData.bkZusatzPositionen?.length > 0 && (
                <div className="summary-field">
                  <span className="summary-label">Zusatz-BK-Positionen:</span>
                  <span className="summary-value">
                    {formData.bkZusatzPositionen.join(", ")}
                  </span>
                </div>
              )}
              {formData.wegVerweisSchluessel && (
                <div className="summary-field">
                  <span className="summary-label">WEG-Verweis:</span>
                  <span className="summary-value">
                    {formData.wegVerweisSchluessel}
                  </span>
                </div>
              )}
              {formData.heizwwParagraph && (
                <div className="summary-field">
                  <span className="summary-label">
                    Heiz-/WW-Regelung:
                  </span>
                  <span className="summary-value">
                    {heizwwLabels[formData.heizwwParagraph] ||
                      formData.heizwwParagraph}
                  </span>
                </div>
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">Nutzung & Zutritt</div>
              {formData.untervermietungKlausel && (
                <div className="summary-field">
                  <span className="summary-label">Untervermietung:</span>
                  <span className="summary-value">
                    {formData.untervermietungKlausel}
                  </span>
                </div>
              )}
              {formData.tierhaltungTon && (
                <div className="summary-field">
                  <span className="summary-label">Tierhaltung:</span>
                  <span className="summary-value">{formData.tierhaltungTon}</span>
                </div>
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">
                Instandhaltung
              </div>
              {formData.srModell && (
                <div className="summary-field">
                  <span className="summary-label">
                    SR-Modell:
                  </span>
                  <span className="summary-value">
                    {formData.srModell}
                  </span>
                </div>
              )}
              {formData.kleinrepJeVorgang && (
                <div className="summary-field">
                  <span className="summary-label">
                    Kleinrep. je Vorgang:
                  </span>
                  <span className="summary-value">
                    {formData.kleinrepJeVorgang} EUR
                  </span>
                </div>
              )}
              {formData.kleinrep_jahr && (
                <div className="summary-field">
                  <span className="summary-label">Jahresobergrenze:</span>
                  <span className="summary-value">{formData.kleinrep_jahr}</span>
                </div>
              )}
              {formData.sr_zuschuss && (
                <div className="summary-field">
                  <span className="summary-label">SR-Zuschuss:</span>
                  <span className="summary-value">
                    {formData.sr_zuschuss === "ja"
                      ? formData.sr_zuschuss_betrag
                        ? `${formData.sr_zuschuss_betrag} EUR`
                        : "Ja"
                      : "Nein"}
                  </span>
                </div>
              )}
              {formData.sr_mietfrei && (
                <div className="summary-field">
                  <span className="summary-label">Mietfrei:</span>
                  <span className="summary-value">
                    {formData.sr_mietfrei === "ja"
                      ? `${formData.sr_mietfrei_monate || 0} Monate`
                      : "Nein"}
                  </span>
                </div>
              )}
              {formData.endrueckgabe && (
                <div className="summary-field">
                  <span className="summary-label">Endrückgabe:</span>
                  <span className="summary-value">{formData.endrueckgabe}</span>
                </div>
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">Haftung & Veräußerung</div>
              {formData.haftung536a && (
                <div className="summary-field">
                  <span className="summary-label">Haftung §536a:</span>
                  <span className="summary-value">{formData.haftung536a}</span>
                </div>
              )}
              {formData.umgebung_laerm && (
                <div className="summary-field">
                  <span className="summary-label">Umgebung / Lärm:</span>
                  <span className="summary-value">{formData.umgebung_laerm}</span>
                </div>
              )}
              {formData.aufrechnung && (
                <div className="summary-field">
                  <span className="summary-label">Aufrechnung:</span>
                  <span className="summary-value">{formData.aufrechnung}</span>
                </div>
              )}
              {formData.veraeusserung && (
                <div className="summary-field">
                  <span className="summary-label">Veräußerung:</span>
                  <span className="summary-value">{formData.veraeusserung}</span>
                </div>
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">Prüfung</div>
              {formData.anlagen?.length > 0 && (
                <div className="summary-field">
                  <span className="summary-label">Anlagen:</span>
                  <span className="summary-value">{formData.anlagen.join(", ")}</span>
                </div>
              )}
              {formData.bearbeiter && (
                <div className="summary-field">
                  <span className="summary-label">
                    Bearbeiter:
                  </span>
                  <span className="summary-value">
                    {formData.bearbeiter}
                  </span>
                </div>
              )}
              {formData.freigabe && (
                <div className="summary-field">
                  <span className="summary-label">
                    Freigabe:
                  </span>
                  <span className="summary-value">
                    {formData.freigabe}
                  </span>
                </div>
              )}
            </div>

            {combinedMasksDownloadHref && (
              <div className="summary-section">
                <div className="summary-title">Datenexport</div>
                <p className="help-text" style={{ marginBottom: "0.75rem" }}>
                  Kombinierte Masken A und B als JSON-Datei speichern.
                </p>
                <a
                  href={combinedMasksDownloadHref}
                  download="masken-a-und-b.json"
                  className="button button-secondary"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  <FileText /> Mask A & B als JSON herunterladen
                </a>
              </div>
            )}

            {formData.freigabe === "Ja" && (
              <div
                className="alert alert-success"
                style={{ marginTop: "1.5rem" }}
              >
                <p
                  style={{
                    marginBottom: "1rem",
                    fontWeight: "600",
                  }}
                >
                  ✓ Freigabe erteilt – Vertrag kann erzeugt werden
                </p>
                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-success"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <FileText /> Download öffnen
                  </a>
                ) : (
                  <button
                    onClick={exportFinalJSON}
                    className="button button-success"
                    style={{ width: "100%" }}
                    disabled={isGenerating}
                  >
                    <FileText /> Vertrag als Word-Dokument
                    herunterladen
                  </button>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="anwalt-page">
      <div className="anwalt-hero">
        <h1>Mietvertragserfassung</h1>
        <p>Anwaltsmaske – Juristische Entscheidungen & Klauselwahl</p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "12px",
            flexWrap: "wrap",
          }}
        >
          <span
            className={`status-pill ${showImport
              ? "warning"
              : importStatus === "done"
                ? "success"
                : "info"
              }`}
          >
            {importMessage}
          </span>
          {isGenerating && (
            <span className="status-pill info">
              📤 Vertrag wird erzeugt…
            </span>
          )}
          {downloadUrl && (
            <span className="status-pill success">
              ✅ Download-Link bereit
            </span>
          )}
        </div>
      </div>

      {!showImport && mandantendaten && (
        <div className="form-card-v2" style={{ marginBottom: "16px" }}>
          <div className="anwalt-stepper">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;
              return (
                <div
                  key={step}
                  className={`anwalt-step ${isActive ? "active" : ""
                    } ${isDone ? "completed" : ""}`}
                >
                  <div className="icon">
                    {isDone ? <Check /> : idx + 1}
                  </div>
                  <div className="labels">
                    <div className="title">{step}</div>
                    <div className="desc">
                      Schritt {idx + 1} von {steps.length}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {apiError && (
        <div className="alert alert-warning">{apiError}</div>
      )}

      {downloadUrl && (
        <div className="alert alert-success">
          <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
            Der Vertrag wurde erstellt. Sie können den Download-Link hier
            öffnen:
          </p>
          <a href={downloadUrl} target="_blank" rel="noreferrer">
            {downloadUrl}
          </a>
        </div>
      )}

      <div className="form-card-v2">{renderStep()}</div>

      {!showImport && mandantendaten && (
        <div className="nav-buttons-container">
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isGenerating}
            className="button button-secondary"
          >
            <ChevronLeft /> Zurück
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="button button-primary"
              style={{ background: "#7c3aed" }}
              disabled={isGenerating}
            >
              Weiter <ChevronRight />
            </button>
          ) : (
            <button
              onClick={exportFinalJSON}
              disabled={formData.freigabe !== "Ja" || isGenerating}
              className="button button-success"
            >
              <Check /> Abschließen & Exportieren
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**********************
 * ROOT APP
 **********************/
export default function App() {
  const [currentView, setCurrentView] = useState("mandant");

  return (
    <>
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-title">
            Mietvertrag-Erfassung
          </h1>
          <div className="nav-buttons">
            <button
              onClick={() => setCurrentView("mandant")}
              className={
                "nav-button " +
                (currentView === "mandant" ? "active" : "")
              }
            >
              📝 Mandantenmaske
            </button>
            <button
              onClick={() => setCurrentView("anwalt")}
              className={
                "nav-button anwalt " +
                (currentView === "anwalt" ? "active" : "")
              }
            >
              ⚖️ Anwaltsmaske
            </button>
          </div>
        </div>
      </nav>

      {currentView === "mandant" ? (
        <MandantenMaske />
      ) : (
        <AnwaltsMaske />
      )}
    </>
  );
}


