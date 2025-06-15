Nodal Staging Analysis Tool (Version 3.2.0)

## 1. Einleitung

### 1.1. Zweck und Geltungsbereich
Das **Nodal Staging: Avocado Sign vs. T2 Criteria** Analysis Tool ist eine client-seitige Webanwendung, die als hochspezialisiertes Instrument für die **wissenschaftliche Forschung** in der radiologischen Diagnostik des Rektumkarzinoms konzipiert wurde. Ihr primäres Ziel ist die tiefgehende, reproduzierbare Analyse und der Vergleich der diagnostischen Leistung verschiedener MRT-basierter Kriterien zur Beurteilung des mesorektalen Lymphknotenstatus (N-Status).

Der wissenschaftliche Fokus liegt auf der rigorosen Evaluation des innovativen, Kontrastmittel-basierten **Avocado Sign (AS)** im direkten Vergleich mit einem Spektrum von T2-gewichteten (T2w) morphologischen Kriterien. Dies umfasst:
1.  **Etablierte, literaturbasierte T2w-Kriterien:** Anwendung und Validierung von Kriterien aus einflussreichen Publikationen auf die jeweils passenden Patientenkohorten.
2.  **Datengetriebene, kohorten-optimierte T2w-Kriterien:** Identifizierung eines "Best-Case"-Szenarios für die T2w-Morphologie durch eine systemische Brute-Force-Analyse auf dem vorliegenden Datensatz.

Die Anwendung begleitet den gesamten Forschungsprozess – von der explorativen Datenanalyse über die statistische Auswertung bis hin zur automatisierten Erstellung von publikationsreifen Manuskriptentwürfen, die auf die strengen Stilrichtlinien des Fachjournals *Radiology* zugeschnitten sind.

### 1.2. Kernfunktionalitäten
* **Interaktive Datenexploration:** Eine performante, sortier- und filterbare Tabellenansicht des pseudonymisierten Patientendatensatzes ermöglicht eine intuitive Untersuchung der Rohdaten, inklusive einer aufklappbaren Detailansicht für individuelle Lymphknotenmerkmale.
* **Flexible Kriteriendefinition:** Ein interaktives Bedienfeld erlaubt die dynamische Definition und Kombination von T2w-Malignitätskriterien. Schwellenwerte, Merkmalsausprägungen und logische Verknüpfungen (AND/OR) können live modifiziert und deren Auswirkungen auf die Gesamtanalyse sofort evaluiert werden.
* **Automatisierte Kriterien-Optimierung:** Ein integrierter Brute-Force-Algorithmus, der in einem separaten Web Worker läuft, um die UI nicht zu blockieren, testet systematisch tausende von Kriterienkombinationen. Er identifiziert mathematisch die optimale Kombination zur Maximierung einer vom Nutzer gewählten Zieldiagnostik (z.B. "Balanced Accuracy"). Die besten Ergebnisse werden persistent im Browser gespeichert.
* **Umfassende statistische Analyse:** Die Anwendung berechnet automatisch alle relevanten Metriken zur diagnostischen Güte (Sensitivität, Spezifität, PPV, NPV, Genauigkeit, AUC) inklusive 95%-Konfidenzintervallen und führt statistische Vergleichstests (z.B. DeLong, McNemar) zum direkten Vergleich der diagnostischen Methoden durch.
* **Publikations-Assistent:** Ein dediziertes Modul generiert automatisch formatierte, englischsprachige Texte, Tabellen und Abbildungen für ein wissenschaftliches Manuskript. Die Inhalte basieren auf den aktuellsten Analyseergebnissen und halten sich präzise an die Stilrichtlinien des Fachjournals *Radiology*.
* **Vielseitiger Datenexport:** Ein zentraler Export-Hub ermöglicht den Download von Rohdaten, Analyseergebnissen, Tabellen, Grafiken und Publikationstexten in diversen gängigen Formaten (CSV, Markdown, TXT, PNG, SVG, HTML), wahlweise als Einzeldateien oder gebündelte ZIP-Archive.

### 1.3. Wichtiger Hinweis: Forschungsinstrument
**Disclaimer:** Diese Anwendung ist ausschließlich für **Forschungs- und Bildungszwecke** konzipiert. Die dargestellten Daten, Statistiken und generierten Texte basieren auf einem statischen, pseudonymisierten Forschungsdatensatz von 106 Fällen. **Die Ergebnisse dürfen unter keinen Umständen für die klinische Diagnostik, direkte Behandlungsentscheidungen oder andere primäre medizinische Anwendungen herangezogen werden.** Die wissenschaftliche und klinische Verantwortung für die Interpretation und Verwendung der generierten Ergebnisse liegt allein beim Nutzer.

## 2. Einrichtung und globale Bedienkonzepte

### 2.1. Systemanforderungen & Einrichtung
* **Systemanforderungen:** Ein moderner Desktop-Webbrowser (z.B. aktuelle Versionen von Google Chrome, Mozilla Firefox, Microsoft Edge oder Safari). Die Unterstützung von Web Workers ist für die volle Funktionalität (Brute-Force-Optimierung) erforderlich.
* **Einrichtung:** Es ist keine serverseitige Komponente oder Installation notwendig. Die Anwendung wird durch Öffnen der Datei `index.html` direkt im Browser gestartet. Für das initiale Laden externer Bibliotheken (z.B. Bootstrap, D3.js) von Content Delivery Networks (CDNs) wird eine Internetverbindung benötigt.

### 2.2. Globale UI-Konzepte
* **Header & Navigation:** Ein feststehender Kopfbereich bietet schnellen Zugriff auf den Anwendungstitel, die globale Kohortenauswahl und Live-Statistiken. Eine darunterliegende Navigationsleiste ermöglicht den Wechsel zwischen den sechs Hauptmodulen (Tabs).
* **Globale Kohortenauswahl:** Dies ist das zentrale Steuerungselement. Drei Buttons im Header (**"Overall"**, **"Surgery alone"**, **"Neoadjuvant therapy"**) filtern den gesamten Datensatz. Diese Auswahl ist global und beeinflusst unmittelbar alle Berechnungen, Tabellen und Grafiken in der gesamten Anwendung.
* **Dynamische Header-Statistiken:** Zeigt eine Live-Zusammenfassung der aktiven Kohorte, inklusive der Anzahl der Patienten und des prozentualen Anteils positiver Fälle für die N-, AS- und interaktiv definierten T2-Kriterien.
* **Interaktive Hilfe:** Nahezu alle Bedienelemente sind mit detaillierten **Tooltips** versehen. Ein **Quick Guide** (?-Button) bietet eine umfassende Anleitung zu allen Funktionen.

## 3. Die Anwendungsmodule im Detail (Tabs)

Jeder Tab stellt ein spezialisiertes Modul für eine bestimmte Phase des wissenschaftlichen Arbeitsprozesses dar.

### 3.1. Data Tab
* **Zweck:** Darstellung und Exploration des zugrundeliegenden Patientendatensatzes.
* **Workflow:** Der Nutzer kann die Patiententabelle nach jeder Spalte sortieren. Ein Klick auf die Spaltenüberschrift `N/AS/T2` ermöglicht eine zusätzliche Sortierung nach dem jeweiligen Marker. Bei Patienten mit T2-Daten kann die Zeile erweitert werden, um eine detaillierte Liste der morphologischen Eigenschaften jedes Lymphknotens (Größe, Form, etc.) anzuzeigen.

### 3.2. Analysis Tab
* **Zweck:** Interaktive Definition von T2-Kriterien, Durchführung von Optimierungsanalysen und detaillierte Untersuchung der Kriterienauswirkungen.
* **Workflow:**
    1.  **Analyse:** Der Nutzer erhält über das **Dashboard** eine schnelle grafische Übersicht der Kohorte.
    2.  **Kriteriendefinition:** In der Karte **"Define T2 Malignancy Criteria"** kann der Nutzer interaktiv T2-Kriterien durch Checkboxen, Slider und Buttons definieren und die logische Verknüpfung (AND/OR) wählen. Ein Rahmen signalisiert ungespeicherte Änderungen.
    3.  **Anwendung:** Mit **"Apply & Save"** werden die Kriterien global übernommen. Alle T2-bezogenen Statistiken und Anzeigen in der App aktualisieren sich sofort. Die Einstellungen werden im Browser gespeichert. Die Karte **"Diagnostic Performance (Applied T2)"** zeigt die resultierende diagnostische Güte.
    4.  **Optimierung:** Im Bereich **"Criteria Optimization (Brute-Force)"** kann der Nutzer eine Zielmetrik wählen und eine neue Analyse starten. Während der Ausführung wird der Fortschritt live angezeigt. Die besten, persistent gespeicherten Ergebnisse früherer Läufe werden in einer separaten **Übersichtstabelle** angezeigt.
    5.  **Evaluation:** Die **Analyse-Tabelle** am Ende der Seite zeigt die Auswirkungen der angewandten Kriterien auf jeden einzelnen Patienten. Erweiterbare Zeilen visualisieren, welche Kriterien bei welchem Lymphknoten zur positiven oder negativen Einstufung geführt haben.

### 3.3. Statistics Tab
* **Zweck:** Umfassende und formale statistische Auswertung der diagnostischen Leistung.
* **Workflow:** Der Nutzer kann zwischen der Detailansicht einer Kohorte ("Single View") und dem direkten Vergleich zweier Kohorten ("Comparison Active") umschalten. In Informationskarten werden deskriptive Statistiken, die diagnostische Güte von AS und T2, statistische Vergleichstests (McNemar, DeLong) und Assoziationsanalysen präsentiert. Eine zentrale Vergleichstabelle stellt die Performance des AS den Literatur- und den angewandten Kriterien gegenüber.

### 3.4. Comparison Tab
* **Zweck:** Formatiert ausgewählte Analyseergebnisse speziell für wissenschaftliche Präsentationen.
* **Workflow:** Der Nutzer wählt, ob er die alleinige Performance des AS oder den direkten Vergleich mit T2-Kriterien visualisieren möchte. Als T2-Vergleichsbasis kann er entweder die interaktiv definierten Kriterien oder eines der vordefinierten Literatur-Sets auswählen. Die Anwendung generiert daraufhin dynamisch Vergleichstabellen, statistische Tests und ein Balkendiagramm, die alle exportierbar sind.

### 3.5. Publication Tab
* **Zweck:** Ein intelligenter Assistent zur Erstellung eines wissenschaftlichen Manuskripts für das Fachjournal *Radiology*.
* **Workflow:**
    1.  Die Ansicht startet mit einer automatisch generierten, *Radiology*-konformen **Titelseite**.
    2.  Über die **Seitenleiste** kann der Nutzer durch die Manuskript-Abschnitte (Abstract, Introduction, etc.) navigieren; ein Klick scrollt zur entsprechenden Stelle.
    3.  Die Anwendung generiert für jeden Abschnitt **professionell formulierte, englischsprachige Texte**. Diese integrieren dynamisch die neuesten Analyseergebnisse (AS vs. Literatur/BF) und formatieren alle Werte und Zitate gemäß den Stilrichtlinien.
    4.  Über das Dropdown-Menü **"BF Optimization Metric"** kann der Nutzer die Narrative des Textes beeinflussen, indem er festlegt, welches Brute-Force-Ergebnis im Manuskript zitiert werden soll.

### 3.6. Export Tab
* **Zweck:** Zentraler Hub für den Export aller generierten Daten, Ergebnisse und Grafiken.
* **Workflow:** Der Nutzer wählt aus einer Liste von Einzel-Exporten (z.B. Statistik-CSV, Brute-Force-Report) oder gebündelten ZIP-Archiven (z.B. alle Grafiken als PNG). Alle Exporte sind kontext-sensitiv und spiegeln die aktuell gewählte globale Kohorte wider.

## 4. Technischer Überblick

### 4.1. Anwendungsarchitektur & Datenfluss
Die Anwendung folgt einer klaren, modularen Architektur, die auf einer Trennung von Datenlogik, Service-Funktionen und UI-Darstellung basiert:
1.  **Event-Handler (`event_manager.js`):** Fängt Benutzerinteraktionen (z.B. Klicks, Änderungen) ab.
2.  **State-Manager (`state.js`):** Verwaltet den globalen Zustand der Anwendung (z.B. aktive Kohorte, Sortierreihenfolge).
3.  **App-Controller (`main.js`):** Orchestriert den Datenfluss. Reagiert auf Zustandsänderungen, indem er die Neuberechnung und Neu-Renderung anstößt.
4.  **Core-Module (`core/`):** Verarbeiten und evaluieren die Rohdaten (`data_processor.js`, `t2_criteria_manager.js`).
5.  **Service-Schicht (`services/`):** Enthält die komplexe Geschäftslogik für Statistik (`statistics_service.js`), Export (`export_service.js`), Brute-Force-Optimierung (`brute_force_manager.js`) und Publikationserstellung (`publication_service.js`).
6.  **UI-Schicht (`ui/`):** Ist für die Darstellung der Daten verantwortlich. `ui_manager.js` steuert globale UI-Elemente, während die `tabs/`- und `components/`-Module die spezifischen Ansichten und wiederverwendbaren Elemente rendern.

### 4.2. Verzeichnisstruktur mit allen Dateien

```
/
├── css/
│   └── style.css
├── data/
│   └── data.js
├── docs/
│   ├── Anwendungsbeschreibung.txt
│   ├── Barbaro_2024_summary.txt
│   ├── Koh_2008_summary.txt
│   ├── Lurz_Schaefer_AvocadoSign_2025.pdf.txt
│   ├── Lurz_Schaefer_AvocadoSign_2025_summary.txt
│   ├── Radiology_Publication_Instructions_for_Authors.md
│   ├── Radiology_Scientific_Style_Guide.md
│   └── Rutegard_2025_summary.txt
├── js/
│   ├── app/
│   │   ├── main.js
│   │   └── state.js
│   ├── core/
│   │   ├── data_processor.js
│   │   ├── study_criteria_manager.js
│   │   └── t2_criteria_manager.js
│   ├── services/
│   │   ├── publication_service/
│   │   │   ├── abstract_generator.js
│   │   │   ├── discussion_generator.js
│   │   │   ├── introduction_generator.js
│   │   │   ├── methods_generator.js
│   │   │   ├── publication_helpers.js
│   │   │   ├── references_generator.js
│   │   │   ├── results_generator.js
│   │   │   └── title_page_generator.js
│   │   ├── publication_service.js
│   │   ├── brute_force_manager.js
│   │   ├── export_service.js
│   │   └── statistics_service.js
│   ├── ui/
│   │   ├── components/
│   │   │   ├── chart_renderer.js
│   │   │   ├── flowchart_renderer.js
│   │   │   ├── table_renderer.js
│   │   │   └── ui_components.js
│   │   ├── tabs/
│   │   │   ├── analysis_tab.js
│   │   │   ├── comparison_tab.js
│   │   │   ├── data_tab.js
│   │   │   ├── export_tab.js
│   │   │   ├── publication_tab.js
│   │   │   └── statistics_tab.js
│   │   ├── event_manager.js
│   │   └── ui_manager.js
│   └── utils.js
├── workers/
│   └── brute_force_worker.js
├── index.html
└── README.md
```

### 4.3. Glossar
* **AS:** Avocado Sign
* **AUC:** Area Under the Curve
* **BF:** Brute-Force
* **CI:** Confidence Interval (Konfidenzintervall)
* **nRCT:** Neoadjuvant Chemoradiotherapy
* **NPV:** Negative Predictive Value
* **OR:** Odds Ratio
* **PPV:** Positive Predictive Value
* **RD:** Risk Difference
* **T2w:** T2-weighted
