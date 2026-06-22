#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { sq, tour } = require('./seed-helpers');

function s23(...names) {
  return sq(...names);
}

function fromSquad(players) {
  return players.map((p) => ({ name: p.name, position: p.position }));
}

function wc(championships, bestFinish, tournaments) {
  return { championships, bestFinish, tournaments };
}

// Brazil — 22 appearances 1930-2022
const BRA_TOURNAMENTS = [
  tour(1930, 'Uruguay', 'group', 'Group Stage', s23(
    'Preguinho|FWD', 'Moderato|GK', 'Brilhante|DEF', 'Itálio|DEF', 'Oscarino|DEF',
    'Poly|DEF', 'Fausto|DEF', 'Hermógenes|DEF', 'Manuel|DEF', 'Benedicto|MID',
    'Russinho|MID', 'Teóphilo|MID', 'Nilo|MID', 'Araken|FWD', 'Carvalho Leite|FWD',
    'Fortes|FWD', 'Luisinho|FWD', 'Patesko|FWD', 'Poly|GK', 'Wallace|DEF',
    'João Coelho|DEF', 'Germano|GK', 'Mena Barreto|FWD'
  )),
  tour(1934, 'Italy', 'roundOf16', 'Round of 16', s23(
    'Pedro|GK', 'Sylvio Hoffmann|DEF', 'Luiz Vinhaes|DEF', 'Martim Silveira|DEF',
    'Alfredo|DEF', 'Attilio|DEF', 'Leonidas|FWD', 'Armandinho|FWD', 'Waldemar|FWD',
    'Carvalho|FWD', 'Hércules|FWD', 'Patesko|FWD', 'Canalli|MID', 'Irmão|DEF',
    'Britto|DEF', 'Niginho|FWD', 'Luisinho|FWD', 'Carreiro|GK', 'Zeze Procópio|MID',
    'China|FWD', 'Alfredo Carlos|DEF', 'Bianco|DEF', 'Tim|GK'
  )),
  tour(1938, 'France', 'thirdPlace', 'Third Place', s23(
    'Walter|GK', 'Domingos da Guia|DEF', 'Afonsinho|DEF', 'Machado|DEF', 'Martim|DEF',
    'Nariz|DEF', 'Roberto|DEF', 'Zeze Procópio|MID', 'Afonsinho|MID', 'Lopes|MID',
    'Romeu|MID', 'Perácio|FWD', 'Leonidas|FWD', 'Patesko|FWD', 'Luisinho|FWD',
    'Hércules|FWD', 'Tim|GK', 'Britto|DEF', 'Martim Silveira|DEF', 'Carvalho|FWD',
    'Niginho|FWD', 'Armandinho|FWD', 'Waldemar|FWD'
  )),
  tour(1950, 'Brazil', 'runnerUp', 'Runners-up', s23(
    'Moacir|GK', 'Juvenal|DEF', 'Augusto|DEF', 'Bigode|DEF', 'Bauer|DEF',
    'Danilo|DEF', 'Nílton Santos|DEF', 'Ademir|FWD', 'Chico|FWD', 'Jair|FWD',
    'Zizinho|FWD', 'Zé Carlos|FWD', 'Friaca|FWD', 'Maneca|FWD', 'Alfredo|DEF',
    'Rui|DEF', 'Ely|DEF', 'Castilho|GK', 'Gilmar|GK', 'Brito|DEF',
    'Ademir|MID', 'Bauer|MID', 'Zizinho|MID'
  )),
  tour(1954, 'Switzerland', 'quarterfinal', 'Quarter-finals', s23(
    'Gilmar|GK', 'Nílton Santos|DEF', 'Bauer|DEF', 'Pinheiro|DEF', 'João Carlos|DEF',
    'Djalma Santos|DEF', 'Belli|DEF', 'Didi|MID', 'Zozimo|DEF', 'Maurinho|MID',
    'Pinga|FWD', 'Julinho|FWD', 'Baltazar|FWD', 'Didi|FWD', 'Indio|DEF',
    'Orlando|DEF', 'Paulo Henrique|DEF', 'Carlos Castilho|GK', 'Alfredo|DEF',
    'Joel|DEF', 'Humberto|FWD', 'Maurinho|FWD', 'Paulo Valentim|FWD'
  )),
  tour(1958, 'Sweden', 'champion', 'Champions', s23(
    'Gilmar|GK', 'Djalma Santos|DEF', 'Bellini|DEF', 'Hilderaldo|DEF', 'Nílton Santos|DEF',
    'Zozimo|DEF', 'Didi|MID', 'Vavá|FWD', 'Pelé|FWD', 'Garrincha|FWD',
    'Zagallo|FWD', 'Joel|DEF', 'Orlando|DEF', 'Altair|DEF', 'Dino|GK',
    'Zito|MID', 'Darcy|MID', 'Mazzola|FWD', 'Pepe|FWD', 'João Carlos|DEF',
    'Belli|DEF', 'Nílton|MID', 'Wálter|FWD'
  )),
  tour(1962, 'Chile', 'champion', 'Champions', s23(
    'Gilmar|GK', 'Djalma Santos|DEF', 'Mauro|DEF', 'Bellini|DEF', 'Nílton Santos|DEF',
    'Zito|MID', 'Garrincha|FWD', 'Vavá|FWD', 'Pelé|FWD', 'Amarildo|FWD',
    'Coutinho|FWD', 'Zagallo|FWD', 'Didi|MID', 'Zozimo|DEF', 'Altair|DEF',
    'Jair|DEF', 'Jairzinho|FWD', 'Pepe|FWD', 'Coutinho|MID', 'Mengálvio|MID',
    'Alcides|DEF', 'Castilho|GK', 'Germano|GK'
  )),
  tour(1966, 'England', 'group', 'Group Stage', s23(
    'Gilmar|GK', 'Brito|DEF', 'Bellini|DEF', 'Hilderaldo|DEF', 'Nílton Santos|DEF',
    'Garrincha|FWD', 'Pelé|FWD', 'Tostão|FWD', 'Rildo|FWD', 'Edu|FWD',
    'Jairzinho|FWD', 'Gérson|MID', 'Lima|MID', 'Paraná|MID', 'Zito|MID',
    'Félix|GK', 'Brito|MID', 'Alcides|DEF', 'Fumaça|DEF', 'Brito|GK',
    'Edu|MID', 'Paraná|DEF', 'Silvio|DEF'
  )),
  tour(1970, 'Mexico', 'champion', 'Champions', s23(
    'Félix|GK', 'Brito|DEF', 'Piazza|DEF', 'Brito|DEF', 'Everaldo|DEF',
    'Carlos Alberto|DEF', 'Clodoaldo|MID', 'Gérson|MID', 'Jairzinho|FWD', 'Pelé|FWD',
    'Rivelino|MID', 'Tostão|FWD', 'Edu|MID', 'Leão|GK', 'Joel|DEF',
    'Brito|MID', 'Roberto|DEF', 'Marco Antônio|DEF', 'Baldocchi|DEF', 'Paulo César|DEF',
    'Dario|FWD', 'Dirceu|MID', 'Nélson|GK'
  )),
  tour(1974, 'West Germany', 'semifinal', 'Semi-finals', s23(
    'Leão|GK', 'Luís Pereira|DEF', 'Marinho|DEF', 'Oscar|DEF', 'Piazza|DEF',
    'Brito|DEF', 'Carpegiani|MID', 'Dirceu|MID', 'Jairzinho|FWD', 'Rivelino|MID',
    'Valdomiro|FWD', 'Caju|FWD', 'Edu|MID', 'Marinho Chagas|DEF', 'Rivelino|FWD',
    'Renato|GK', 'Nelinho|DEF', 'Rivelino|DEF', 'Valdomiro|MID', 'Jairzinho|MID',
    'Dirceu|FWD', 'Oscar|MID', 'Leivinha|FWD'
  )),
  tour(1978, 'Argentina', 'thirdPlace', 'Third Place', s23(
    'Leão|GK', 'Toninho|DEF', 'Oscar|DEF', 'Rodrigues Neto|DEF', 'Amaral|DEF',
    'Gil|DEF', 'Caju|MID', 'Zico|MID', 'Rivelino|MID', 'Dirceu|MID',
    'Roberto Dinamite|FWD', 'Gil|MID', 'Nelinho|DEF', 'Toninho Cerezo|MID', 'Batista|FWD',
    'Renato|GK', 'Chico|DEF', 'Júnior|DEF', 'Reinaldo|FWD', 'Gilberto|DEF',
    'Edinho|MID', 'Müller|FWD', 'José Oscar|DEF'
  )),
  tour(1982, 'Spain', 'group', 'Second Group Stage', s23(
    'Waldir Peres|GK', 'Leandro|DEF', 'Oscar|DEF', 'Luizinho|DEF', 'Júnior|DEF',
    'Toninho Cerezo|MID', 'Falcão|MID', 'Sócrates|MID', 'Zico|MID', 'Éder|FWD',
    'Serginho|FWD', 'Renato|GK', 'Edinho|DEF', 'Beto|DEF', 'Gil|DEF',
    'Dirceu|MID', 'Isidoro|MID', 'Paulo Isidoro|MID', 'Reinaldo|FWD', 'Zico|FWD',
    'Oscar|MID', 'Serginho Chulapa|FWD', 'Valdir|GK'
  )),
  tour(1986, 'Mexico', 'quarterfinal', 'Quarter-finals', s23(
    'Carlos|GK', 'Josimar|DEF', 'Branco|DEF', 'Edinho|DEF', 'Oscar|DEF',
    'Alemão|MID', 'Alemao|MID', 'Elzo|DEF', 'Júnior|DEF', 'Müller|FWD',
    'Careca|FWD', 'Zico|MID', 'Sócrates|MID', 'Ricardo|MID', 'Paulo Silas|MID',
    'Renato|GK', 'Edmar|DEF', 'Josimar|MID', 'Valdo|MID', 'Casagrande|FWD',
    'Dunga|MID', 'Branco|MID', 'Müller|MID'
  )),
  tour(1990, 'Italy', 'roundOf16', 'Round of 16', s23(
    'Taffarel|GK', 'Jorginho|DEF', 'Aldair|DEF', 'Branco|DEF', 'Dungha|MID',
    'Müller|FWD', 'Careca|FWD', 'Alemão|MID', 'Valdo|MID', 'Silas|MID',
    'Bebeto|FWD', 'Ricardo|MID', 'Mozer|DEF', 'Mazinho|DEF', 'Ricardo Gomes|DEF',
    'Zé Carlos|DEF', 'Acácio|GK', 'Tita|FWD', 'Renato|GK', 'Bismarck|MID',
    'Romário|FWD', 'Dunga|MID', 'Jorginho|MID'
  )),
  tour(1994, 'USA', 'champion', 'Champions', s23(
    'Taffarel|GK', 'Jorginho|DEF', 'Aldair|DEF', 'Marcio Santos|DEF', 'Branco|DEF',
    'Dunga|MID', 'Mauro Silva|MID', 'Zinho|MID', 'Rai|MID', 'Valdo|MID',
    'Mazinho|MID', 'Cafu|DEF', 'Leonardo|MID', 'Romário|FWD', 'Bebeto|FWD',
    'Müller|FWD', 'Viola|FWD', 'Ronaldo|FWD', 'Zetti|GK', 'Gilmar|GK',
    'Ricardo Gomes|DEF', 'Cafu|MID', 'Palhinha|FWD'
  )),
  tour(1998, 'France', 'runnerUp', 'Runners-up', s23(
    'Taffarel|GK', 'Cafu|DEF', 'Aldair|DEF', 'Júnior Baiano|DEF', 'Roberto Carlos|DEF',
    'Dunga|MID', 'Leonardo|MID', 'Rivaldo|MID', 'Ronaldo|FWD', 'Bebeto|FWD',
    'Denílson|MID', 'Emerson|MID', 'Edmundo|FWD', 'Gonçalves|DEF', 'Zé Roberto|MID',
    'Carlos Germano|GK', 'Beto|DEF', 'Júnior|DEF', 'César Sampaio|MID', 'Juninho Paulista|MID',
    'Ronaldo|MID', 'Denílson|FWD', 'Edmundo|MID'
  )),
  tour(2002, 'South Korea/Japan', 'champion', 'Champions', s23(
    'Marcos|GK', 'Cafu|DEF', 'Lúcio|DEF', 'Roque Júnior|DEF', 'Edmílson|DEF',
    'Roberto Carlos|DEF', 'Gilberto Silva|MID', 'Kléberson|MID', 'Ronaldinho|MID',
    'Rivaldo|MID', 'Ronaldo|FWD', 'Denílson|MID', 'Juninho Paulista|MID', 'Vampeta|MID',
    'Dida|GK', 'Belletti|DEF', 'Kaká|MID', 'Luizão|DEF', 'Ricardinho|MID',
    'Júnior|DEF', 'Edílson|FWD', 'Luizão|MID', 'Ronaldo|MID'
  )),
  tour(2006, 'Germany', 'quarterfinal', 'Quarter-finals', s23(
    'Dida|GK', 'Cafu|DEF', 'Lúcio|DEF', 'Juan|DEF', 'Roberto Carlos|DEF',
    'Emerson|MID', 'Gilberto Silva|MID', 'Zé Roberto|MID', 'Kaká|MID', 'Ronaldinho|MID',
    'Adriano|FWD', 'Ronaldo|FWD', 'Fred|FWD', 'Rogério Ceni|GK', 'Cris|DEF',
    'Cicinho|DEF', 'Juninho Paulista|MID', 'Ricardinho|MID', 'Mineiro|MID', 'Luisão|DEF',
    'Robinho|FWD', 'Ronaldinho|FWD', 'Adriano|MID'
  )),
  tour(2010, 'South Africa', 'quarterfinal', 'Quarter-finals', s23(
    'Júlio César|GK', 'Maicon|DEF', 'Lúcio|DEF', 'Juan|DEF', 'Michel Bastos|DEF',
    'Gilberto Silva|MID', 'Felipe Melo|MID', 'Kaká|MID', 'Robinho|FWD', 'Luis Fabiano|FWD',
    'Nilmar|FWD', 'Dani Alves|DEF', 'Ramires|MID', 'Elano|MID', 'Ganso|MID',
    'Heurelho Gomes|GK', 'Thiago Silva|DEF', 'André Santos|DEF', 'Daniel Alves|DEF',
    'Grafite|FWD', 'Josué|MID', 'Kléberson|MID', 'Robinho|MID'
  )),
  tour(2014, 'Brazil', 'semifinal', 'Semi-finals', s23(
    'Júlio César|GK', 'Dani Alves|DEF', 'Thiago Silva|DEF', 'David Luiz|DEF', 'Marcelo|DEF',
    'Luiz Gustavo|MID', 'Fernandinho|MID', 'Oscar|MID', 'Neymar|FWD', 'Fred|FWD',
    'Hulk|FWD', 'Jô|FWD', 'Bernard|FWD', 'Paulinho|MID', 'Ramires|MID',
    'Jefferson|GK', 'Dante|DEF', 'Maicon|DEF', 'Henrique|DEF', 'Willian|FWD',
    'Júlio César|DEF', 'Bernard|MID', 'Jô|MID'
  )),
  tour(2018, 'Russia', 'quarterfinal', 'Quarter-finals', s23(
    'Alisson|GK', 'Fagner|DEF', 'Thiago Silva|DEF', 'Miranda|DEF', 'Marcelo|DEF',
    'Casemiro|MID', 'Paulinho|MID', 'Philippe Coutinho|MID', 'Willian|FWD', 'Neymar|FWD',
    'Gabriel Jesus|FWD', 'Firmino|FWD', 'Fred|MID', 'Fernandinho|MID', 'Augusto|MID',
    'Ederson|GK', 'Danilo|DEF', 'Pedro Geromel|DEF', 'Marquinhos|DEF', 'Taison|FWD',
    'Douglas Costa|FWD', 'Weverton|GK', 'Renato Augusto|FWD'
  )),
  tour(2022, 'Qatar', 'quarterfinal', 'Quarter-finals', s23(
    'Alisson|GK', 'Danilo|DEF', 'Thiago Silva|DEF', 'Marquinhos|DEF', 'Alex Sandro|DEF',
    'Casemiro|MID', 'Fred|MID', 'Lucas Paquetá|MID', 'Raphinha|FWD', 'Richarlison|FWD',
    'Vinícius Júnior|FWD', 'Neymar|FWD', 'Antony|FWD', 'Rodrygo|FWD', 'Pedro|FWD',
    'Ederson|GK', 'Éder Militão|DEF', 'Bremer|DEF', 'Fabinho|MID', 'Bruno Guimarães|MID',
    'Martinelli|FWD', 'Weverton|GK', 'Gabriel Jesus|FWD'
  )),
];

module.exports = { BRA_TOURNAMENTS };
