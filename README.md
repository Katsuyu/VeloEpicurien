# Velo Epicurien

## Usage

The database data are stored in a `_dbdata.zip` file. Please extract it
before running the application with:

```bash
$ unzip _dbdata.zip
```

Then run the following command to start the project:

```bash
$ docker-compose up
```

Pay attention to the file `docker-compose.override.yml`. It is present
for development purpose and **MUST** be removed/renamed in order to skip
the ETL process.

The app will expose a 8080 port bound automatically to your local 80 port,
as requested on the subject.

## Routes

### Heartbeat

```
@GET /heartbeat

returns:
{
    "villeChoisie": str
}
```

 * `villeChoisie` : le nom de la ville choisie pour le projet

### Extracted data

```
@GET /extracted_data

returns:
{
    "nbRestaurants":int,
    "nbSegments":int
}
```

 * `nbRestaurants` : le nombre de restaurants contenu dans la base de données
 * `nbSegments` : la nombre de segments dans la base de données

### Transformed data

```
@GET /transformed_data

returns:
{
    "restaurants":{
        $type1: int,
        $type2: int,
        ...
    },
    "longueurCyclable":float
}
```

 * `restaurants` : Contient le nombre de restaurant pour chaque type existant en BDD
 * `longueurCyclable` : Longueur totale de chemins pouvant être utilisés dans l'application
 
### Readme

```
@GET /readme
```

 * Renvoie un fichier readme (en markdown) qui contient tous les appels possibles, les payloads attendus et leurs réponses.

### Types

```
@GET /type

returns:
[
    str,
    str,
    str,
    ...
]
```

 * Renvoie la liste des types de restaurants disponibles dans la BDD

### Starting point

```
@GET /starting_point (avec le payload):
{
    "maximumLength": int (en mètre),
    "type": [str, str, ... ]
}

returns:
{
    "startingPoint" : {"type":"Point", "coordinates":[float, float]}
}
```

Cet appel permet à un utilisateur ou une application cliente d’obtenir un point de départ aléatoire :
 * d’un trajet d’une longueur `maximum_length` ± 10%
 * comprenant des restaurants inclus dans les types définis dans le tableau `type`
 * si le tableau `type` est **vide**, on assume que tous les types sont possibles

### Itineraire

```
@GET /parcours (avec le payload):
{
    "startingPoint" : {"type":"Point", "coordinates":[float, float]},
    "maximumLength": int (en mètre),
    "numberOfStops": int,
    "type": [str, str, ... ]
}

returns:
{
    "type": "FeatureCollection",
    "features": [
        {
            "type":"Feature",
            "geometry":{
                "type": "Point",
                "coordinates":  [float, float]
            },
            "properties":{
                "name":str,
                "type":str
            }
        }, ..., {
            "type":"Feature",
            "geometry":{
                "type": "MultiLineString",
                "coordinates": [[
                     [float, float],  [float, float],  [float, float], ...
                    ]]
            },
            "properties":{
                "length":float (en mètres)
            }
        }
    ]
}
```

Cet appel permet à un utilisateur ou une application cliente d’obtenir:
 * un trajet partant d’un point dans un rayon de 500m du point `startingPoint`
 * le trajet obtenu est d’une longueur de `maximumLength` ± 10%
 * le trajet à au plus (et de préférence) `numberOfStops` arrets
 * qui sont des restaurants inclus dans les types définis dans le tableau `type`
 * si le tableau `type` est **vide**, on assume que tous les types sont possibles

Le trajet obtenu est objet GeoJSON de type featureCollection, soit une liste d’éléments géographiques.

Ces objets sont soit
 - un `Point`, représentant des restaurants, avec les propriétés `name` et `type` représentant respectivement le nom et le type du restaurant
 - un `MultiLineString`, représentant les segments cyclables, avec la propriété `length` représentant la longueur du segment

## Authors

- Guillaume Hector
- Jérémy Levilain
- Jonathan Bibas
