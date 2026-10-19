# Polling & Interrupts · FTS

Offline per Doppelklick auf index.html. Keine Installation oder externe Laufzeitabhängigkeit.

Live: https://pirminheld.github.io/BKI2_IN_Interrupt_Labor/

Zwei identische Hauptaufgaben, ein gemeinsamer Taster; LED 1 toggelt nach jedem abgeschlossenen Hauptprogrammdurchlauf. Die Polling-Variante liest den Taster zyklisch; die Interrupt-Variante erfasst steigende Flanken. Andere Arbeit ist zwischen 0,1 und 3 s einstellbar. Pause, 20-ms-Schritte, Wiedergabegeschwindigkeit, Vergleichsimpuls, Zeitdiagramm und logischer Stack unterstützen die Erklärung.

## Modellgrenzen
Diskretes didaktisches Modell, kein AVR-Emulator. Hauptschritte 120 ms, ISR 120 ms zur Sichtbarkeit. Interruptfreigaben aktiv. Keine verschachtelten Interrupts, keine Entprellung. Die ISR pausiert die andere Arbeit und setzt sie mit unveränderter Restdauer fort. Der Polling-Vergleichsschritt belegt auf beiden Seiten dieselbe Zeit. Die reale Laufzeit von Interrupts ist erheblich kürzer.

Lampe 2 besitzt eine unabhängige Anzeige-Nachleuchtdauer von 1 s. Die ISR wartet nicht; eine Hardware-/Timerimplementierung der Nachleuchtdauer wird abstrahiert. LED 1 startet aus und wechselt nach jedem Hauptprogrammdurchlauf ihren Zustand. Eine ISR verzögert den nächsten Wechsel um ihre Laufzeit. Kein Rechteckeingang. Polling erkennt beobachtete 0→1-Wechsel, nicht jeden einzelnen gedrückten Durchlauf. Der Stack zeigt logische Rückkehrstellen, keine physischen Speicheradressen oder Registersicherungen. Ein schneller Impuls wird in der Interruptanforderung gespeichert. Die Ereignisquelle ist im Modell so langsam, dass keine konkurrierenden Anforderungen entstehen.

FTS-Logo und Impressum aus BKI2_IN_SFR_Labor übernommen. Fachbezug: Microchip ATmega32A Datasheet DS40002072A (2018), Interrupt Handling / Stack Pointer. Abgleich mit Unterrichtsblatt 06.

## Prüfung
`node test-model.cjs`: LED-Toggle und Zyklusdauer, kurzer/langer Impuls, schnelles Polling, Flankenerkennung, Wiederaufnahme und Anzeigedauer. Ergänzende Browserprüfung: Bedienung, Diagramm, Stack, Bildschirmbreiten, Beameransicht, Offlinebetrieb und Impressum.
