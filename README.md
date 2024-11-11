# DelivWeb

le projet DelivWeb va vous permettre de voir les Pays, participants et nombre de médailles obtenu au jeu Olympic

# La première étape est de cloner le projet

Vous pouvez le faire de plusieur façon :

Choix 1 : Choissisez le répertoire ou vosu souhaitez placer le projet
Ouvrez un terminal et dirigez vous la ou vous avez choisi de placer votre projet
exemple : un dossier workspaceAngular
Dans celui-ci entrez :

#### git clone https://github.com/elvis-messiaen/DelivWeb.git

Ensuite ouvrez le depuis Vscode

Choix 2: Vscode
depuis Vscode, sur la partie de gauche vous avez des logo.
Cliquez sur celui qui aura le nom : Source control
une fois la page ouverte cliquez sur Clone repository
entrez le lien https://github.com/elvis-messiaen/DelivWeb.git
il vous demande ou vous souhaitez le mettre
choississez le workspaceAngular que vous avez créer ou l'endroit de votre choix

#### Ouverture du projet depuis Vscode

Une fois cloner. Vous être dans le projet si vous avez cloner depuis Vscode
Sinon depuis VsCode, faite openFolder et allez chercher le projet la ou il est cloner

#### Installation des dépendances

Ouvrez un Terminal dans Vscode !
Vous pouvez le faire de façon différente. au dessus de Vscode vous avez des onglets cliquz sur Terminal
SI vous avez tous fait comme expliqué précedement vous devez voir le nom du projet
Cela indique que vous êtes dans le projet.
Ecrivez : npm i ou npm install
Si cela ne marche pas c'est que vous n'avez pas de node package manager
je vous invite a le faire en fonction de votre systeme d'exploitation
Rendez vous sur ce site : https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
Je ne ferais pas l'explication de cela. ce n'est pas le sujet. La documentation explique cela très clairement

Une fois que c'est fait, Toujours depuis le terminal de Vscode
Entrez : ng serve
si tous ce passe bien dans ce Terminal vous verez un lien localhost
Copiez ou cliquez dessus pour vous rendre sur l'application

### découverte de l'interface

Une fois sur l'application vous avez la page acceuil ou l'on trouve un Pie (camenbert).
Celui-ci montre les pays participants
Le nom des pays
le nombre des médailes par pays au survol du quartier correspondand au pays
le nombre de pays participants

Lorsque du clic sur un pays
On retouve les informations relatif a ce pays
Le nombre de participations aux JO
Le total de medailles
le nombre d'tthletes
