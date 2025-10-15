# Ghid pentru publicarea modificărilor pe GitHub

Acest proiect rulează în prezent pe un branch local numit `work`, fără niciun remote configurat. Pentru ca modificările să apară în repository-ul tău GitHub, urmează pașii de mai jos.

## 1. Creează repository-ul pe GitHub
1. Intră pe [github.com/new](https://github.com/new) și creează un repository gol.
2. Nu adăuga fișiere implicite (README, .gitignore etc.), ca să eviți conflictele.

## 2. Leagă repository-ul local de cel remote
În terminalul din mediul de lucru rulează:
```bash
git remote add origin https://github.com/<utilizator>/<nume-repo>.git
```
Înlocuiește `<utilizator>` și `<nume-repo>` cu valorile tale. Poți verifica legătura cu:
```bash
git remote -v
```

## 3. Publică branch-ul local
Dacă vrei să folosești `main` ca branch principal, redenumește branch-ul curent și publică-l:
```bash
git branch -M main
git push -u origin main
```
Dacă preferi să păstrezi numele `work`, înlocuiește `main` cu `work` în comenzile de mai sus.

## 4. Actualizează ulterior repository-ul
După ce ai configurat remote-ul:
```bash
git add .
git commit -m "Mesajul commit-ului"
git push
```
Orice commit împins către remote va apărea imediat pe GitHub.

## Sfaturi utile
- `git status` îți arată ce fișiere sunt modificate.
- `git log --oneline` listează istoricul commit-urilor.
- Dacă GitHub îți cere autentificare, folosește un token personal în locul parolei.

Respectând pașii de mai sus, link-ul de GitHub va reflecta modificările din mediul local.
