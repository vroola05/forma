# Conditie in mailtemplates:
- Binnen een template wordt niet direct gebruik gemaakt van condities. Elke dynamische waarde die je wilt tonen komt uit een veld of een variabele.
- Een variabel begint met $.var


# Variables page

- variable name - De naam van de variabele
- variable tag - Tag is een helper die bijvoorbeeld aangeeft waar de variabele wordt gebruikt: op de dankpagina, mail, backend functie
- variable value - Een array met objecten die bestaan uit een condition en een value een condition is een object die true of false teruggeeft (is al reeds gebouwd). De value kan bestaan uit een string, veldwaarde, of een geconcatinate string: [{ condition, value }]

# conditities in prefillers:

{
  "prefiller_id": "crm_sync_json",
  "method": "POST",
  "url": "https://crm.nl",
  "headers": { "Content-Type": "application/json" },
  "variables": {
    "KlantType": {"var": "form.algemeen.type_klant"},
    "WeergaveNaam": {
      "if": [
        {"==": [{"var": "form.algemeen.type_klant"}, "Zakelijk"]},
        {"var": "form.algemeen.bedrijfsnaam"},
        {"cat": [{"var": "form.algemeen.voornaam"}, " ", {"var": "form.algemeen.achternaam"}]}
      ]
    },
    "BtwNummer": {
      "if": [
        {"==": [{"var": "form.algemeen.type_klant"}, "Zakelijk"]},
        {"var": "form.algemeen.kvk"},
        "NietVanToepassing"
      ]
    }
  },
  "body_template": "{\n  \"customer_type\": \"{{KlantType}}\",\n  \"display_name\": \"{{WeergaveNaam}}\",\n  \"tax_id\": \"{{BtwNummer}}\"\n}"
}

# Algemene info uit gemini over prefillers

Als we kijken naar geavanceerde formulier-engines (zoals Typeform, Jotform of Formstack), zijn dit de belangrijkste en meest waardevolle mogelijkheden van een prefiller, gecategoriseerd op jouw punten:

1. De Trigger (Wanneer start de prefiller?)

Een prefiller hoeft niet alleen te draaien bij het laden van het formulier.
- Bij initialisatie (On Load): De standaard. Vult direct data in op basis van een URL-parameter (bijv. ?email=piet@test.nl) of de ingelogde gebruiker.
- Bij een wijziging (On Change): De prefiller vuurt pas af zodra een specifiek veld wordt ingevuld.
    - Voorbeeld: De gebruiker vult een KVK-nummer of Postcode in \(\rightarrow \) de prefiller start een API-request om de adresgegevens op te halen.
- Conditionele trigger: De prefiller start alleen als er aan een JsonLogic-regel wordt voldaan.
    - Voorbeeld: IF $.form.algemeen.type_klant == 'Zakelijk' AND $.form.algemeen.kvk IS NOT EMPTY \(\rightarrow \) start prefiller.

2. De REQUEST (Data verzenden)
Hier wil je flexibel variabelen kunnen injecteren in je API-call.
- Dynamische URL-parameters of Headers: Data uit het formulier meesturen in de URL (bijv. /api/company/{{form.kvk}}) of een Bearer token meegeven in de header.- Conditionele Request Payload: De JSON-body die je verstuurt verandert op basis van eerdere antwoorden.
    - Voorbeeld: Als de gebruiker kiest voor "Optie A", stuur dan { "type": "advanced", "id": 123 } mee, anders { "type": "basic" }.

3. De RESPONSE (Data ontvangen en mappen)
Dit is waar het vaak complex wordt. Je ontvangt een JSON-response van een externe API, en die moet landen in jouw formuliervelden.
- JSON Mapping (JSONPath): Je moet kunnen definiëren welk deel van de response in welk veld komt.
    - Voorbeeld: $.response.data.address.city moet geplakt worden in $.form.adres.woonplaats.
- Conditionele Response (Fallback logica): Wat als de API niet de verwachte data teruggeeft, of als een veld leeg is in de response?
    - Voorbeeld: IF $.response.company_name IS NOT EMPTY THEN $.form.naam = $.response.company_name ELSE $.form.naam = $.response.legal_name.
- Array handhaving (Dynamische formulieren): Als de API een lijst met objecten teruggeeft (bijvoorbeeld: een lijst met contactpersonen bij een bedrijf), wil je dat de prefiller dynamisch nieuwe formulier-rijen of herhalende velden (repeater fields) aanmaakt en vult.

4. Alternatieve Prefill-bronnen (Naast API's)
Prefillen gebeurt niet altijd via een externe POST/GET request. Het is handig als jouw prefill-engine ook deze bronnen ondersteunt:
- URL/Query Parameters: Direct uitlezen van de URL (?utm_source=linkedin) en dit in een verborgen veld stoppen.
- Sessie / LocalStorage: Data hergebruiken van een vorig formulier dat de gebruiker heeft ingevuld.
- Statische Excel/CSV tabellen: Een geüploade lijst in de back-end. Voorbeeld: De gebruiker typt een unieke kortingscode, de prefiller zoekt in een geüploade tabel naar de waarde en vult de korting in.

Hoe past dit in de architectuur met JsonLogic?
Als je dit gaat bouwen, kun je een prefiller definiëren als een JSON-configuratieobject. Omdat je al hebt gekozen voor een centrale conditionele engine, kun je JsonLogic op drie plekken binnen één prefiller hergebruiken:
```
{
  "prefiller_name": "KVK Adres Ophalen",
  "trigger_condition": { 
    // JsonLogic: Vuur alleen af als KVK 8 cijfers heeft
    "==": [ {"strlen": [{"var": "form.algemeen.kvk"}]}, 8 ] 
  },
  "request": {
    "method": "GET",
    "url": "https://kvk.nl",
    "params": {
      "kvkNummer": {"var": "form.algemeen.kvk"} // Dynamische input
    }
  },
  "response_mapping": [
    {
      "target_field": "form.adres.straat",
      "value": {"var": "response.data.location.street"} // Mappen naar veld
    },
    {
      "target_field": "form.adres.stad",
      "value": {
        // Conditionele response mapping: pak stad, anders regio
        "if": [
          {"!=": [{"var": "response.data.city"}, ""]},
          {"var": "response.data.city"},
          {"var": "response.data.region"}
        ]
      }
    }
  ]
}
```