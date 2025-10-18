⚙️ Beispiele mit Presets

1) Python-Webprojekt (FastAPI/Flask), typische Artefakte raus:

python codedump_from_zip.py mein_projekt.zip \
  --preset python-web --show-metadata


2) React-Frontend + Node-Backend in einem Monorepo:

python codedump_from_zip.py fullstack_app.zip \
  --preset react --preset node-app \
  --show-metadata --sort path


3) Data-Science-Repo, große Daten raus, Jupyter-Notebooks drin:

python codedump_from_zip.py analysis.zip \
  --preset data-science --max-size 1500000 --binaries skip


4) Komplettes Full-Stack-Dump mit konservativem Size-Limit:

python codedump_from_zip.py repo.zip --preset full-stack


5) Rust-Crate oder Java-Maven:

python codedump_from_zip.py lib.zip --preset rust-crate
python codedump_from_zip.py service.zip --preset java-maven --show-metadata


6) Presets + Feintuning (kombinieren & überschreiben):

python codedump_from_zip.py app.zip \
  --preset react --preset node-app \
  --exclude "**/storybook-static/**" --max-size 900000

Hinweise & Best Practices