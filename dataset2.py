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
CUL_CON = URIRef("http://webprotege.stanford.edu/hasCulturalContext")
SPA_CON = URIRef("http://webprotege.stanford.edu/hasSpatialContext")
TECH_CON = URIRef("http://webprotege.stanford.edu/hasTechnologicalContext")
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
CREA_RESULT = URIRef("http://webprotege.stanford.edu/resultsIn")
USER = URIRef("http://webprotege.stanford.edu/experiencedBy")

def get_labels(g, individual, object_prop, label_prop, required_types=None, default_none=" ", default_unknown=" "):
    """
    Retrieves labels for individuals linked via specified object properties.
    """
    labels = []
    
    # Make sure 'object_prop' is a list
    if not isinstance(object_prop, list):
        object_prop = [object_prop]  

    # Make sure 'required_types' is a list if provided
    if required_types and not isinstance(required_types, list):
        required_types = [required_types]
    
    # Iterate over list of object properties
    for p in object_prop:
        for linked_individual in g.objects(subject=individual, predicate=p):
        
            # Check type
            passes_filter = True 
            if required_types:
                passes_filter = False
                for req_type in required_types:
                    if (linked_individual, RDF.type, req_type) in g:
                        passes_filter = True
                        break # Found, stop searching
            
            # Get label
            if passes_filter:
                label_literal = g.value(linked_individual, label_prop) or g.value(linked_individual, HAS_NAME)
                
                if label_literal:
                    labels.append(str(label_literal))
                else:
                    labels.append(default_unknown)
    
    if labels:
        # Delete duplicates while preserving order
        # Convert to dict and back to list
        unique_labels = list(dict.fromkeys(labels))
        return ", ".join(unique_labels)
    else:
        return default_none

def get_two_hop_labels(g, individual, prop_hop1, keyword, prop_hop2, label_prop, default_none=" ", default_unknown=" "):
    """
    Evaluates a 2-hop relationship.
    Retrieves labels for the final individuals reached after two hops,
    filtering the intermediate individuals by a keyword in their label.
    1st hop: from 'individual' via 'prop_hop1' to 'mid_individual'
    2nd hop: from 'mid_individual' via 'prop_hop2' to 'final_individual'
    """
    final_labels = []
    
    # Hop 1: From aesthetic to phase (e.g. Y2K -> Y2K_Convergence_Phase)
    for mid_individual in g.objects(subject=individual, predicate=prop_hop1):
        
        # Check label/name of mid_individual for keyword
        mid_label_literal = g.value(mid_individual, label_prop) or g.value(mid_individual, HAS_NAME)
        
        if mid_label_literal and keyword.lower() in str(mid_label_literal).lower():
            
            # Key word match. Now Hop 2: From phase to process (e.g. Y2K_Convergence_Phase -> Selection)
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

# Main function to extract aesthetics data
def extract_aesthetics_from_ontology(file_path):
    g = Graph()
    g.parse(file_path, format='turtle')

    # A 'card' defining which properties to extract for each column.
    # 'types' en 'prop2'/'keyword' are optional and only for 2-hop queries.
    extraction_map = [
        # 1-hop queries (simple and with optional type filtering)
        {'col': 'Context', 'prop': [TEMP_CON, CUL_CON, SPA_CON, TECH_CON]},
        {'col': 'User',          'prop': USER},
        {'col': 'Creator',          'prop': CREATOR},
        {'col': 'Influence',        'prop': INFLUENCE},
        {'col': 'Spread Through',   'prop': SPREAD},
        {'col': 'Inspiration',      'prop': INSPIRATION},
        {'col': 'Aesthetic Element','prop': CHAR_BY, 'types': [AES_EL]},
        {'col': 'Lifestyle',        'prop': INV_BEH, 'types': [LIFESTYLE, BEH_PAT]},
        {'col': 'Creative Result',  'prop': CREA_RESULT},
        {'col': 'Emotion',          'prop': EMOTION},
        
        # 2-hop queries (with intermediate filtering)
        {'col': 'Convergence processes',     'type': '2-hop', 'prop1': PROCESS, 'prop2': PROCESS, 'keyword': 'Convergence'},
        {'col': 'Divergence processes',      'type': '2-hop', 'prop1': PROCESS, 'prop2': PROCESS, 'keyword': 'Divergence'},
        {'col': 'Metaconvergence processes', 'type': '2-hop', 'prop1': PROCESS, 'prop2': PROCESS, 'keyword': 'Metaconvergence'},
    ]

    aesthetic_data = []

    for individual in g.subjects(predicate=RDF.type, object=AESTHETIC_CLASS):
        
        # Start the row dictionary for this individual
        data_row = {}

        # === Data properties === #
        data_row['Aesthetic'] = str(g.value(individual, HAS_NAME) or " ")
        data_row['Description'] = str(g.value(individual, DC_DESCRIPTION) or " ")

        # === Object properties === #
        for task in extraction_map:
            col_name = task['col']
            
            if task.get('type') == '2-hop':
                # Perform 2-hop query
                data_row[col_name] = get_two_hop_labels(g, individual, 
                                                        task['prop1'], 
                                                        task['keyword'], 
                                                        task['prop2'], 
                                                        LABEL)
            else:
                # Perform 1-hop query
                # .get('types', None) makes 'types' optional
                types_filter = task.get('types', None)
                data_row[col_name] = get_labels(g, individual, 
                                                task['prop'], 
                                                LABEL, 
                                                required_types=types_filter)
        
        # Add the completed row to the dataset
        aesthetic_data.append(data_row)
    
    aesthetics_df = pd.DataFrame(aesthetic_data)
    return aesthetics_df

aesthetic_df = extract_aesthetics_from_ontology("./ontologycore/ontologycore-251102.ttl")
print(aesthetic_df)

aesthetic_df.to_csv("aesthetics_dataset.csv", index=False)