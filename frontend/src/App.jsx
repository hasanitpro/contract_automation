import { useState } from "react";

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
    eigeneName: "",
    eigeneAnschrift: "",
    eigeneEmail: "",
    eigeneTelefon: "",
    eigeneIBAN: "",
    wirdVertreten: "",
    vertreterName: "",
    vollmachtVorhanden: "",
    ustId: "",
    steuerNummer: "",
    gegenparteiBekannt: "",
    gegenparteiName: "",
    gegenparteiAnschrift: "",
    gegenparteiEmail: "",
    gegenparteiTelefon: "",
    objektadresse: "",
    wohnungsbezeichnung: "",
    wohnungsart: "",
    wohnflaeche: "",
    bezugsfertigSeit: "",
    aussenbereich: [],
    nebenraeume: [],
    stellplatz: "",
    stellplatzNummer: "",
    mitvermieteteAusstattung: "",
    weg: "",
    miteigentumsanteile: "",
    grundrissDatei: "",
    wegDokument: "",
    zustandBeiUebergabe: "",
    schluesselGesamtzahl: "",
    mietbeginn: "",
    vertragsart: "",
    grundmiete: "",
    zuschlagMoebliert: "",
    zuschlagGewerbe: "",
    zuschlagUntervermietung: "",
    vzHeizWW: "",
    vzSonstigeBK: "",
    stellplatzmiete: "",
    zahlungsart: "",
    zahlerIban: "",
    bkModell: "",
    abrechnungszeitraum: "",
    bkweg: "",
    nutzung: "",
    untervermietungGeplant: "",
    haustiere: "",
    haustiereDetails: "",
    kaution: "3",
    kautionZahlweise: "",
    kautionsform: "",
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
      toNumber(formData.vzHeizWW) +
      toNumber(formData.vzSonstigeBK) +
      toNumber(formData.stellplatzmiete);
    return formatCurrency(total);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.rolle)
        newErrors.rolle = "Bitte wählen Sie Ihre Rolle.";
      if (!formData.eigeneName)
        newErrors.eigeneName = "Name ist erforderlich.";
      if (!formData.eigeneAnschrift)
        newErrors.eigeneAnschrift = "Anschrift ist erforderlich.";
      if (!formData.eigeneEmail)
        newErrors.eigeneEmail = "E-Mail ist erforderlich.";
      if (!formData.eigeneTelefon)
        newErrors.eigeneTelefon = "Telefon ist erforderlich.";
      if (!formData.eigeneIBAN)
        newErrors.eigeneIBAN = "IBAN ist erforderlich.";
      if (formData.wirdVertreten === "ja" && !formData.vertreterName)
        newErrors.vertreterName = "Bitte benennen Sie den Vertreter.";
      if (formData.wirdVertreten === "ja" && !formData.vollmachtVorhanden)
        newErrors.vollmachtVorhanden = "Bitte wählen Sie eine Option zur Vollmacht.";
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
      if (!formData.bezugsfertigSeit)
        newErrors.bezugsfertigSeit = "Bitte wählen Sie das Bezugsfertig-Datum.";
      if (!formData.weg)
        newErrors.weg = "Bitte wählen Sie eine Option zur WEG.";
    }

    if (step === 2) {
      if (!formData.zustandBeiUebergabe)
        newErrors.zustandBeiUebergabe = "Bitte wählen Sie den Zustand.";
      if (!formData.schluesselGesamtzahl)
        newErrors.schluesselGesamtzahl = "Bitte geben Sie die Schlüsselanzahl an.";
    }

    if (step === 3) {
      if (!formData.mietbeginn)
        newErrors.mietbeginn = "Mietbeginn ist erforderlich.";
      if (!formData.vertragsart)
        newErrors.vertragsart = "Bitte wählen Sie die Vertragsart.";
    }

    if (step === 4) {
      if (!formData.grundmiete)
        newErrors.grundmiete = "Grundmiete ist erforderlich.";
      if (!formData.zahlungsart)
        newErrors.zahlungsart = "Bitte wählen Sie die Zahlungsart.";
      if (!formData.bkModell)
        newErrors.bkModell = "Bitte wählen Sie das Betriebskostenmodell.";
      if (!formData.abrechnungszeitraum)
        newErrors.abrechnungszeitraum = "Bitte wählen Sie den Abrechnungszeitraum.";
      if (!formData.bkweg)
        newErrors.bkweg = "Bitte wählen Sie eine Option zur BK-Umlage.";
      if (!formData.vzHeizWW)
        newErrors.vzHeizWW = "Bitte geben Sie die Vorauszahlung Heizung/Warmwasser an.";
      if (!formData.vzSonstigeBK)
        newErrors.vzSonstigeBK = "Bitte geben Sie die Betriebskosten-Vorauszahlung an.";
    }

    if (step === 5) {
      if (!formData.nutzung)
        newErrors.nutzung = "Bitte wählen Sie die Nutzung.";
      if (!formData.untervermietungGeplant)
        newErrors.untervermietungGeplant = "Bitte geben Sie eine Angabe zur Untervermietung an.";
      if (!formData.haustiere)
        newErrors.haustiere = "Bitte wählen Sie eine Option zur Tierhaltung.";
      if (
        formData.haustiere === "sondervereinbarung" &&
        !formData.haustiereDetails
      ) {
        newErrors.haustiereDetails = "Bitte beschreiben Sie die Sondervereinbarung.";
      }
    }

    if (step === 6) {
      if (!formData.kaution)
        newErrors.kaution = "Bitte geben Sie die Kautionshöhe an.";
      if (!formData.kautionZahlweise)
        newErrors.kautionZahlweise = "Bitte wählen Sie die Zahlweise.";
      if (!formData.kautionsform)
        newErrors.kautionsform = "Bitte wählen Sie die Kautionsform.";
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
      Timestamp: new Date().toISOString(),
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
                className={`input ${errors.eigeneName ? "error" : ""}`}
                value={formData.eigeneName}
                onChange={(e) => updateFormData("eigeneName", e.target.value)}
                placeholder="Max Mustermann bzw. Muster GmbH"
              />
              {errors.eigeneName && (
                <div className="error-text">{errors.eigeneName}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Anschrift <span className="required">*</span>
              </label>
              <textarea
                className={`textarea ${errors.eigeneAnschrift ? "error" : ""}`}
                value={formData.eigeneAnschrift}
                onChange={(e) =>
                  updateFormData("eigeneAnschrift", e.target.value)
                }
                placeholder="Musterstraße 1, 12345 Musterstadt"
                rows="2"
              ></textarea>
              {errors.eigeneAnschrift && (
                <div className="error-text">{errors.eigeneAnschrift}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                E-Mail <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`input ${errors.eigeneEmail ? "error" : ""}`}
                value={formData.eigeneEmail}
                onChange={(e) => updateFormData("eigeneEmail", e.target.value)}
                placeholder="beispiel@email.de"
              />
              {errors.eigeneEmail && (
                <div className="error-text">{errors.eigeneEmail}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Telefon <span className="required">*</span>
              </label>
              <input
                type="tel"
                className={`input ${errors.eigeneTelefon ? "error" : ""}`}
                value={formData.eigeneTelefon}
                onChange={(e) => updateFormData("eigeneTelefon", e.target.value)}
                placeholder="+49 123 456789"
              />
              {errors.eigeneTelefon && (
                <div className="error-text">{errors.eigeneTelefon}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                IBAN (Zahlungsempfänger) <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.eigeneIBAN ? "error" : ""}`}
                value={formData.eigeneIBAN}
                onChange={(e) => updateFormData("eigeneIBAN", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
              />
              {errors.eigeneIBAN && (
                <div className="error-text">{errors.eigeneIBAN}</div>
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
                      checked={formData.wirdVertreten === value}
                      onChange={(e) =>
                        updateFormData("wirdVertreten", e.target.value)
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.wirdVertreten === "ja" && (
              <div className="highlight-box">
                <div className="field-v2">
                  <label>
                    Vertreten durch (Name/Firma) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input ${errors.vertreterName ? "error" : ""}`}
                    value={formData.vertreterName}
                    onChange={(e) =>
                      updateFormData("vertreterName", e.target.value)
                    }
                    placeholder="z.B. Hausverwaltung Müller GmbH"
                  />
                  {errors.vertreterName && (
                    <div className="error-text">{errors.vertreterName}</div>
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
                          checked={formData.vollmachtVorhanden === value}
                          onChange={(e) =>
                            updateFormData("vollmachtVorhanden", e.target.value)
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.vollmachtVorhanden && (
                    <div className="error-text">{errors.vollmachtVorhanden}</div>
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
                value={formData.steuerNummer}
                onChange={(e) => updateFormData("steuerNummer", e.target.value)}
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
                value={formData.wohnungsbezeichnung}
                onChange={(e) =>
                  updateFormData("wohnungsbezeichnung", e.target.value)
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
                className={`input ${errors.bezugsfertigSeit ? "error" : ""}`}
                value={formData.bezugsfertigSeit}
                onChange={(e) =>
                  updateFormData("bezugsfertigSeit", e.target.value)
                }
              />
              {errors.bezugsfertigSeit && (
                <div className="error-text">{errors.bezugsfertigSeit}</div>
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
                className={`select ${errors.zustandBeiUebergabe ? "error" : ""}`}
                value={formData.zustandBeiUebergabe}
                onChange={(e) =>
                  updateFormData("zustandBeiUebergabe", e.target.value)
                }
              >
                <option value="">Bitte wählen...</option>
                <option>Renoviert</option>
                <option>Teilsaniert</option>
                <option>Unrenoviert</option>
              </select>
              {errors.zustandBeiUebergabe && (
                <div className="error-text">{errors.zustandBeiUebergabe}</div>
              )}
            </div>

            <div className="field-v2">
              <label>
                Gesamtanzahl Schlüssel <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`input ${errors.schluesselGesamtzahl ? "error" : ""}`}
                value={formData.schluesselGesamtzahl}
                onChange={(e) =>
                  updateFormData("schluesselGesamtzahl", e.target.value)
                }
              />
              {errors.schluesselGesamtzahl && (
                <div className="error-text">{errors.schluesselGesamtzahl}</div>
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
                className={`input ${errors.vzHeizWW ? "error" : ""}`}
                value={formData.vzHeizWW}
                onChange={(e) => updateFormData("vzHeizWW", e.target.value)}
                placeholder="z.B. 130"
              />
              {errors.vzHeizWW && (
                <div className="error-text">{errors.vzHeizWW}</div>
              )}
            </div>

            <div className="field-v2">
              <label>Vorauszahlung übrige Betriebskosten (EUR)</label>
              <input
                type="number"
                className={`input ${errors.vzSonstigeBK ? "error" : ""}`}
                value={formData.vzSonstigeBK}
                onChange={(e) =>
                  updateFormData("vzSonstigeBK", e.target.value)
                }
                placeholder="z.B. 220"
              />
              {errors.vzSonstigeBK && (
                <div className="error-text">{errors.vzSonstigeBK}</div>
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
                      checked={formData.bkModell === value}
                      onChange={(e) => updateFormData("bkModell", e.target.value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.bkModell && (
                <div className="error-text">{errors.bkModell}</div>
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
                      checked={formData.untervermietungGeplant === value}
                      onChange={(e) =>
                        updateFormData("untervermietungGeplant", e.target.value)
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.untervermietungGeplant && (
                <div className="error-text">{errors.untervermietungGeplant}</div>
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
                  className={`textarea ${errors.haustiereDetails ? "error" : ""}`}
                  rows="3"
                  value={formData.haustiereDetails}
                  onChange={(e) =>
                    updateFormData("haustiereDetails", e.target.value)
                  }
                  placeholder="Beschreiben Sie die individuelle Vereinbarung zur Tierhaltung..."
                ></textarea>
                {errors.haustiereDetails && (
                  <div className="error-text">{errors.haustiereDetails}</div>
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
                <span className="summary-value">{formData.eigeneName || "-"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">E-Mail</span>
                <span className="summary-value">{formData.eigeneEmail || "-"}</span>
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
              <div className="summary-title">Miete & Kosten</div>
              <div className="summary-row">
                <span className="summary-label">Grundmiete</span>
                <span className="summary-value">{formatCurrency(formData.grundmiete)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">VZ Heizung/WW</span>
                <span className="summary-value">{formatCurrency(formData.vzHeizWW)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">VZ Betriebskosten</span>
                <span className="summary-value">{formatCurrency(formData.vzSonstigeBK)}</span>
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
  const [formData, setFormData] = useState({
    vertragsartFinal: "",
    ausschluss545BGB: "",
    indexmiete557b: "",
    staffelmiete: "",
    faelligkeit: "",
    untervermietungKlausel: "",
    tierhaltungTon: "",
    srModell: "",
    kleinrepJeVorgang: "",
    haftung536a: "",
    energieausweisEinbindung: "",
    dsgvoBeiblatt: "",
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
      toNumber(mandantendaten.vzHeizWW) +
      toNumber(mandantendaten.vzSonstigeBK) +
      toNumber(mandantendaten.stellplatzmiete);

    return formatCurrency(total);
  };

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
    if (next.indexmiete557b === "Ja") next.staffelmiete = "Nein";
    if (next.staffelmiete === "Ja") next.indexmiete557b = "Nein";
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
        email: maskAData.eigeneEmail || fallback.mieterEmail || "",
        phone: maskAData.eigeneTelefon || fallback.mieterTelefon || "",
      };
    }

    return {
      email:
        maskAData.gegenparteiEmail ||
        maskAData.eigeneEmail ||
        fallback.mieterEmail ||
        "",
      phone:
        maskAData.gegenparteiTelefon ||
        maskAData.eigeneTelefon ||
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
  };

  const nextStep = () => {
    setCurrentStep((prev) =>
      Math.min(prev + 1, steps.length - 1)
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              {renderSummaryField("Name / Firma", mandantendaten?.eigeneName)}
              {renderSummaryField("E-Mail", mandantendaten?.eigeneEmail)}
              {renderSummaryField("Telefon", mandantendaten?.eigeneTelefon)}
            </div>

            <div className="summary-section">
              <div className="summary-title">Objektangaben</div>
              {renderSummaryField("Objektadresse", mandantendaten?.objektadresse)}
              {renderSummaryField(
                "Wohneinheit",
                mandantendaten?.wohnungsart || mandantendaten?.wohnungsbezeichnung
              )}
              {renderSummaryField(
                "Heizkosten (EUR)",
                mandantendaten?.vzHeizWW,
                formatCurrency
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">Mietzeit</div>
              {renderSummaryField("Mietbeginn", mandantendaten?.mietbeginn)}
              {renderSummaryField(
                "Bezugsfertig seit",
                mandantendaten?.bezugsfertigSeit
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
                  Befristet
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">
                § 545 BGB ausschließen{" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Ja"
                    checked={
                      formData.ausschluss545BGB === "Ja"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "ausschluss545BGB",
                        e.target.value
                      )
                    }
                  />
                  Ja - § 545 BGB wird ausgeschlossen
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Nein"
                    checked={
                      formData.ausschluss545BGB === "Nein"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "ausschluss545BGB",
                        e.target.value
                      )
                    }
                  />
                  Nein - § 545 BGB gilt
                </label>
              </div>
              <div className="help-text">
                Verhindert stillschweigende Verlängerung durch
                fortgesetzte Nutzung
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="section-title">
              Miethöhe & Betriebskosten
            </h2>

            <div className="alert alert-warning">
              <strong>
                ⚠️ Indexmiete und Staffelmiete schließen sich
                gegenseitig aus!
              </strong>
            </div>

            <div className="form-group">
              <label className="label">
                Indexmiete (§ 557b BGB){" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Ja"
                    checked={formData.indexmiete557b === "Ja"}
                    onChange={(e) =>
                      updateFormData(
                        "indexmiete557b",
                        e.target.value
                      )
                    }
                  />
                  Ja - Indexmiete vereinbaren
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Nein"
                    checked={
                      formData.indexmiete557b === "Nein"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "indexmiete557b",
                        e.target.value
                      )
                    }
                  />
                  Nein
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">
                Staffelmiete{" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Ja"
                    checked={formData.staffelmiete === "Ja"}
                    onChange={(e) =>
                      updateFormData(
                        "staffelmiete",
                        e.target.value
                      )
                    }
                  />
                  Ja - Staffelmiete vereinbaren
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Nein"
                    checked={formData.staffelmiete === "Nein"}
                    onChange={(e) =>
                      updateFormData(
                        "staffelmiete",
                        e.target.value
                      )
                    }
                  />
                  Nein
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">
                Fälligkeit / Mahnsystem{" "}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="spätestens 3. Werktag"
                    checked={
                      formData.faelligkeit ===
                      "spätestens 3. Werktag"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "faelligkeit",
                        e.target.value
                      )
                    }
                  />
                  Spätestens 3. Werktag des Monats
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="abweichend"
                    checked={
                      formData.faelligkeit === "abweichend"
                    }
                    onChange={(e) =>
                      updateFormData(
                        "faelligkeit",
                        e.target.value
                      )
                    }
                  />
                  Abweichende Regelung
                </label>
              </div>
            </div>
          </div>
        );

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
                className="select"
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
            </div>

            <div className="form-group">
              <label className="label">
                Tierhaltung - Klauselton{" "}
                <span className="required">*</span>
              </label>
              <select
                className="select"
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
                className="select"
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
            </div>

            <div className="form-group">
              <label className="label">
                Bearbeiter{" "}
                <span className="required">*</span>
              </label>
              <input
                type="text"
                className="input"
                value={formData.bearbeiter}
                onChange={(e) =>
                  updateFormData(
                    "bearbeiter",
                    e.target.value
                  )
                }
                placeholder="z.B. RAin Dr. Müller"
              />
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
              {formData.ausschluss545BGB && (
                <div className="summary-field">
                  <span className="summary-label">
                    § 545 ausgeschlossen:
                  </span>
                  <span className="summary-value">
                    {formData.ausschluss545BGB}
                  </span>
                </div>
              )}
            </div>

            <div className="summary-section">
              <div className="summary-title">
                Miethöhe & BK
              </div>
              {formData.indexmiete557b && (
                <div className="summary-field">
                  <span className="summary-label">
                    Indexmiete:
                  </span>
                  <span className="summary-value">
                    {formData.indexmiete557b}
                  </span>
                </div>
              )}
              {formData.staffelmiete && (
                <div className="summary-field">
                  <span className="summary-label">
                    Staffelmiete:
                  </span>
                  <span className="summary-value">
                    {formData.staffelmiete}
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
            </div>

            <div className="summary-section">
              <div className="summary-title">Prüfung</div>
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


