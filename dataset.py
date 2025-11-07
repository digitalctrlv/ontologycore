
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
EMOTION = URIRef ("http://webprotege.stanford.edu/involvesEmotion")
CREATOR = URIRef ("http://webprotege.stanford.edu/createdBy")

# Function to get ALL labels of linked individuals via an object property
def get_linked_label(g, individual, object_prop, label_prop, default_none=" ", default_unknown=" "):
    labels = []
    
    # Gebruik g.objects() om ALLE gelinkte individuen te krijgen
    for linked_individual in g.objects(subject=individual, predicate=object_prop):
        label_literal = g.value(linked_individual, label_prop)
        
        if label_literal:
            labels.append(str(label_literal))
        else:
            labels.append(default_unknown)
    
    if labels:
        return ", ".join(labels) 
    else:
        return default_none

# Function to get filtered types of linked individuals via an object property
def get_filtered_labels(g, individual, object_prop, label_prop, required_types, default_none=" "):
    """
    1. Follows an object property,
    2. Filters the results by a required type,
    3. Returns a string of all found labels, separated by a comma.
    """
    labels = []

    if not isinstance(required_types, list):
        required_types = [required_types]
    
    # Uses g.objects to retrieve all linked individuals via the object property
    for linked_individual in g.objects(subject=individual, predicate=object_prop):

        has_required_type = False
        for req_type in required_types:
            if (linked_individual, RDF.type, req_type) in g:
                has_required_type = True
                break  # Stop searching for required types if one is found

        if has_required_type:
            label_literal = g.value(linked_individual, label_prop)
            if label_literal:
                labels.append(str(label_literal))
            else:
                labels.append(" ")
    
    if labels:
        # Concatenate labels into a single string
        return ", ".join(labels) 
    else:
        return default_none      

# Main function to extract aesthetics from the ontology
def extract_aesthetics_from_ontology(file_path):
    g = Graph()
    g.parse(file_path, format='turtle')

    aesthetic_data = []

    for individual in g.subjects(predicate=RDF.type, object=AESTHETIC_CLASS):
        
        # === Data properties === #
        name_literal = g.value(individual, HAS_NAME)
        desc_literal = g.value(individual, DC_DESCRIPTION)

        name = str(name_literal) if name_literal else " "
        description = str(desc_literal) if desc_literal else " "

        # === Object properties === #
        temporal_context = get_linked_label(g, individual, TEMP_CON, LABEL)
        influence = get_linked_label(g, individual, INFLUENCE, LABEL)
        # # if the aesthetic is linked through the object property CHAR_BY and the link individual is not a type AES_EL, we skip it
        aes_el = get_filtered_labels(g, individual, CHAR_BY, LABEL, AES_EL)
        life_style = get_filtered_labels(g, individual, INV_BEH, LABEL, [LIFESTYLE, BEH_PAT])
        spread_through = get_linked_label(g, individual, SPREAD, LABEL)
        inspiration = get_linked_label(g, individual, INSPIRATION, LABEL)
        emotion = get_linked_label(g, individual, EMOTION, LABEL)
        creator = get_linked_label(g, individual, CREATOR, LABEL)


        aesthetic_data.append({
            'Aesthetic': name, 
            'Description': description,
            'Temporal Context': temporal_context,
            'Influence': influence,
            'Aesthetic Element': aes_el,
            'Lifestyle': life_style,
            'Spread Through': spread_through,
            'Inspiration': inspiration,
            'Emotion': emotion,
            'Creator': creator,
            })
    
    aesthetics_df = pd.DataFrame(aesthetic_data)

    return aesthetics_df

aesthetic_df = extract_aesthetics_from_ontology("./ontologycore/ontologycore-251102.ttl", AESTHETIC_CLASS)
print(aesthetic_df)

aesthetic_df.to_csv("aesthetics_dataset.csv", index=False)
# Save the DataFrame to a CSV file



