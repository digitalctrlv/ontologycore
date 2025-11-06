# Extracting the dataset of aesthetics from the ontologycore-251102.ttl file
from rdflib import Graph, URIRef, Literal
from rdflib.namespace import RDF, RDFS
import pandas as pd

def extract_aesthetics_from_ontology(file_path):
    g = Graph()
    g.parse(file_path, format='turtle')

    AESTHETIC_INDIVIDUAL = URIRef("http://webprotege.stanford.edu/Aesthetic")

    aesthetic_data = []  # Use a list to collect multiple dictionaries

    # Debug: Print all subjects and their types
    for subj, obj in g.subject_objects(RDF.type):
        if obj == AESTHETIC_INDIVIDUAL:
            name = g.value(subj, URIRef("http://webprotege.stanford.edu/hasName")) or "Unknown"
            print(name)
            description = g.value(subj, URIRef("http://webprotege.stanford.edu/dcdescription")) or "No description"

            # Append each aesthetic as a dictionary to the list
            aesthetic_data.append({'Aesthetic': name, 'Description': description})
    
    # Create DataFrame
    aesthetics_df = pd.DataFrame(aesthetic_data)

    return aesthetics_df

# Call the function
extract_aesthetics_from_ontology("/Users/anoukflinkert/Desktop/DHDK_2425_S2/KRE/ontologycore/ontologycore-251102.ttl")


