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

## Authors

- Guillaume Hector
- Jérémy Levilain
- Jonathan Bibas
