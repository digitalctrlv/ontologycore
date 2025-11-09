# """
# This script creates a dataset of aesthetics from the turtle ontology file ontologycore-251102.ttl.
# Each aesthetic (Y2K, Cottagecore, Dark Academia) is an individual of the Aesthetic class in the ontology.
# The script extracts data properties and object properties and stores them in a csv file using pandas.
# After, we will ask an LLM to generate more instances to complement the custom dataset.
# """

import pandas as pd
from rdflib import Graph, URIRef
from rdflib.namespace import RDF
from rdflib import Graph, URIRef, Literal, Namespace
from rdflib.namespace import RDFS


# Define URIs for relevant properties
LABEL = URIRef("http://www.w3.org/2000/01/rdf-schema#label")
AESTHETIC_CLASS = URIRef("http://webprotege.stanford.edu/Aesthetic")
HAS_NAME = URIRef("http://webprotege.stanford.edu/hasName")
DC_DESCRIPTION = URIRef("http://purl.org/dc/elements/1.1/description")
TEMP_CON = URIRef("http://webprotege.stanford.edu/hasTemporalContext")
INFLUENCE = URIRef("http://webprotege.stanford.edu/influencedBy")
CHAR_BY = URIRef("http://webprotege.stanford.edu/characterizedBy")
AES_EL = URIRef("http://webprotege.stanford.edu/AestheticElement")
LIFESTYLE = URIRef("http://webprotege.stanford.edu/LifeStyle")
BEH_PAT = URIRef("http://webprotege.stanford.edu/BehaviourPattern")
INV_BEH = URIRef("http://webprotege.stanford.edu/involvesBehaviour")
SPREAD = URIRef("http://webprotege.stanford.edu/spreadThrough")
INSPIRATION = URIRef("http://webprotege.stanford.edu/inspiredBy")
EMOTION = URIRef("http://webprotege.stanford.edu/involvesEmotion")
CREATOR = URIRef("http://webprotege.stanford.edu/createdBy")
PROCESS = URIRef("http://webprotege.stanford.edu/involvesProcess")

def get_labels(g, individual, object_prop, label_prop, required_types=None, default_none=" ", default_unknown=" "):
    """
    Evalueert een 1-staps relatie.
    Haalt ALLE labels op voor een object property.
    Filtert optioneel op een lijst van 'required_types'.
    Gebruikt HAS_NAME als fallback voor rdfs:label.
    """
    labels = []
    
    # Zorg ervoor dat 'required_types' altijd een lijst is als het bestaat
    if required_types and not isinstance(required_types, list):
        required_types = [required_types]
    
    for linked_individual in g.objects(subject=individual, predicate=object_prop):
        
        # --- Type Check ---
        passes_filter = True # Ga ervan uit dat het goed is
        if required_types:
            passes_filter = False # Bewijs het tegendeel
            for req_type in required_types:
                if (linked_individual, RDF.type, req_type) in g:
                    passes_filter = True
                    break # Gevonden, stop met zoeken
        
        # --- Label ophalen ---
        if passes_filter:
            # Gebruik rdfs:label OF hasName als fallback
            label_literal = g.value(linked_individual, label_prop) or g.value(linked_individual, HAS_NAME)
            
            if label_literal:
                labels.append(str(label_literal))
            else:
                labels.append(default_unknown)
    
    if labels:
        return ", ".join(labels)
    else:
        return default_none

def get_two_hop_labels(g, individual, prop_hop1, keyword, prop_hop2, label_prop, default_none=" ", default_unknown=" "):
    """
    Evalueert een 2-staps relatie op basis van een trefwoord op het 'middelste' individu.
    Pad: Individu --(prop_hop1)--> MiddenIndividu --(prop_hop2)--> EindIndividu
    Filtert MiddenIndividu op 'keyword'.
    Retourneert labels van EindIndividu.
    """
    final_labels = []
    
    # Hop 1: Van Aesthetic naar Fase (bv. Y2K -> Y2K_Convergence_Phase)
    for mid_individual in g.objects(subject=individual, predicate=prop_hop1):
        
        # Controleer label/naam van het middelste individu
        mid_label_literal = g.value(mid_individual, label_prop) or g.value(mid_individual, HAS_NAME)
        
        if mid_label_literal and keyword.lower() in str(mid_label_literal).lower():
            
            # Trefwoord match! Nu Hop 2: Van Fase naar Proces (bv. Y2K_Convergence_Phase -> Selection)
            for final_individual in g.objects(subject=mid_individual, predicate=prop_hop2):
                
                final_label_literal = g.value(final_individual, label_prop) or g.value(final_individual, HAS_NAME)
                
                if final_label_literal:
                    final_labels.append(str(final_label_literal))
                else:
                    final_labels.append(default_unknown)

    if final_labels:
        return ", ".join(final_labels)
    else:
        return default_none

# Hoofdfunctie om aesthetics te extraheren
def extract_aesthetics_from_ontology(file_path):
    g = Graph()
    g.parse(file_path, format='turtle')

    # --- DIT IS DE NIEUWE LOGICA ---
    # Een 'kaart' die definieert wat we willen extraheren.
    # 'types' en 'prop2'/'keyword' zijn optioneel.
    extraction_map = [
        # 1-hop queries (simpel en gefilterd)
        {'col': 'Temporal Context', 'prop': TEMP_CON},
        {'col': 'Influence',        'prop': INFLUENCE},
        {'col': 'Spread Through',   'prop': SPREAD},
        {'col': 'Inspiration',      'prop': INSPIRATION},
        {'col': 'Emotion',          'prop': EMOTION},
        {'col': 'Creator',          'prop': CREATOR},
        {'col': 'Aesthetic Element','prop': CHAR_BY, 'types': [AES_EL]},
        {'col': 'Lifestyle',        'prop': INV_BEH, 'types': [LIFESTYLE, BEH_PAT]},
        
        # 2-hop queries (met trefwoord-filter)
        {'col': 'Convergence',     'type': '2-hop', 'prop1': PROCESS, 'prop2': PROCESS, 'keyword': 'Convergence'},
        {'col': 'Divergence',      'type': '2-hop', 'prop1': PROCESS, 'prop2': PROCESS, 'keyword': 'Divergence'},
        {'col': 'Metaconvergence', 'type': '2-hop', 'prop1': PROCESS, 'prop2': PROCESS, 'keyword': 'Metaconvergence'},
    ]

    aesthetic_data = []

    for individual in g.subjects(predicate=RDF.type, object=AESTHETIC_CLASS):
        
        # Start de datarij voor deze aesthetic
        data_row = {}

        # === Data properties (deze zijn simpel) === #
        data_row['Aesthetic'] = str(g.value(individual, HAS_NAME) or " ")
        data_row['Description'] = str(g.value(individual, DC_DESCRIPTION) or " ")

        # === Object properties (configuratie-gestuurd) === #
        for task in extraction_map:
            col_name = task['col']
            
            if task.get('type') == '2-hop':
                # Voer 2-hop query uit
                data_row[col_name] = get_two_hop_labels(g, individual, 
                                                        task['prop1'], 
                                                        task['keyword'], 
                                                        task['prop2'], 
                                                        LABEL)
            else:
                # Voer 1-hop query uit
                # .get('types', None) haalt de types-lijst op, of 'None' als die niet bestaat
                types_filter = task.get('types', None)
                data_row[col_name] = get_labels(g, individual, 
                                                task['prop'], 
                                                LABEL, 
                                                required_types=types_filter)
        
        # Voeg de complete rij toe
        aesthetic_data.append(data_row)
    
    aesthetics_df = pd.DataFrame(aesthetic_data)
    return aesthetics_df

# --- Je aanroep blijft hetzelfde ---
aesthetic_df = extract_aesthetics_from_ontology("./ontologycore/ontologycore-251102.ttl")
print(aesthetic_df)

aesthetic_df.to_csv("aesthetics_dataset.csv", index=False)