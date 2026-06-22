const { sq, tour } = require('./seed-helpers');
const { BRA_TOURNAMENTS } = require('./seed-history-brazil');

function s(...names) {
  return sq(...names);
}

function wc(championships, bestFinish, tournaments) {
  return { championships, bestFinish, tournaments };
}

// Scotland 8 appearances
const SCO_T = [
  tour(1954, 'Switzerland', 'group', 'Group Stage', s(
    'Fred Martin|GK', 'Willie Cunningham|DEF', 'Tommy Docherty|DEF', 'Jock Shaw|DEF', 'Alex Forbes|DEF',
    'Doug Cowie|DEF', 'Willie Ormond|DEF', 'George Hamilton|FWD', 'Lawrie Reilly|FWD', 'Willie Waddell|FWD',
    'Bobby Johnstone|FWD', 'Jimmy Binning|GK', 'Jock Robertson|DEF', 'Sammy Cox|MID', 'Bobby Collins|MID',
    'Willie Fernie|MID', 'Neil Martin|FWD', 'Alfie Conn|FWD', 'Jimmy Cowan|DEF', 'Eddie Turnbull|MID',
    'Tommy Ring|MID', 'George Johnstone|GK', 'Billy Liddell|FWD'
  )),
  tour(1958, 'Sweden', 'group', 'Group Stage', s(
    'Tommy Younger|GK', 'Bobby Evans|DEF', 'Eric Caldow|DEF', 'Tommy Docherty|DEF', 'Alex Forbes|DEF',
    'Doug Cowie|DEF', 'Graham Leggat|FWD', 'Willie Fernie|MID', 'Bobby Collins|MID', 'Sammy Baird|FWD',
    'Alex Scott|FWD', 'Jimmy Binning|GK', 'Jock Robertson|DEF', 'Eddie Turnbull|MID', 'Bobby Johnstone|FWD',
    'Willie Waddell|FWD', 'Lawrie Reilly|FWD', 'George Hamilton|FWD', 'Willie Ormond|FWD', 'Bobby Evans|MID',
    'Tommy Ring|MID', 'Fred Martin|GK', 'Billy Liddell|FWD'
  )),
  tour(1974, 'West Germany', 'group', 'Group Stage', s(
    'Stewart Kennedy|GK', 'Sandy Jardine|DEF', 'Billy Bremner|DEF', 'Jim Holton|DEF', 'Danny McGrain|DEF',
    'Peter Lorimer|MID', 'Asa Hartford|MID', 'Billy Hughes|MID', 'Kenny Dalglish|FWD', 'Joe Harper|FWD',
    'Tommy Hutchison|MID', 'Jim Cruickshank|GK', 'Martin Buchan|DEF', 'Willie Donachie|DEF', 'Bruce Rioch|MID',
    'Lou Macari|MID', 'Tommy Craig|MID', 'Arthur Graham|FWD', 'Jimmy Johnstone|FWD', 'Peter Cormack|MID',
    'Archie Gemmill|MID', 'Eddie Gray|FWD', 'Colin Stein|FWD'
  )),
  tour(1978, 'Argentina', 'group', 'Group Stage', s(
    'Alan Rough|GK', 'Sandy Jardine|DEF', 'Bruce Rioch|DEF', 'Willie Donachie|DEF', 'Kenny Burns|DEF',
    'Archie Gemmill|MID', 'Asa Hartford|MID', 'Don Masson|MID', 'Kenny Dalglish|FWD', 'Joe Jordan|FWD',
    'Graeme Souness|MID', 'Jim Blyth|GK', 'Stuart Kennedy|GK', 'Danny McGrain|DEF', 'Willie Young|DEF',
    'Bruce Rioch|MID', 'Lou Macari|MID', 'Arthur Graham|FWD', 'Derek Johnstone|FWD', 'Joe Harper|FWD',
    'Tommy Hutchison|MID', 'Steve Archibald|FWD', 'Gordon McQueen|DEF'
  )),
  tour(1982, 'Spain', 'group', 'Group Stage', s(
    'Alan Rough|GK', 'Danny McGrain|DEF', 'Alan Hansen|DEF', 'Willie Miller|DEF', 'Frank Gray|DEF',
    'Graeme Souness|MID', 'Asa Hartford|MID', 'John Wark|MID', 'Kenny Dalglish|FWD', 'Joe Jordan|FWD',
    'Steve Archibald|FWD', 'Jim Leighton|GK', 'David Narey|DEF', 'Alex McLeish|DEF', 'Gordon Strachan|MID',
    'John Robertson|MID', 'David Provan|MID', 'Frank McGarvey|FWD', 'Paul Sturrock|FWD', 'Jim Bett|MID',
    'Willie Miller|MID', 'George Burley|DEF', 'Alan Brazil|FWD'
  )),
  tour(1986, 'Mexico', 'group', 'Group Stage', s(
    'Jim Leighton|GK', 'Richard Gough|DEF', 'Willie Miller|DEF', 'Alex McLeish|DEF', 'Maurice Malpas|DEF',
    'Graeme Souness|MID', 'Roy Aitken|MID', 'Gordon Strachan|MID', 'Kenny Dalglish|FWD', 'Frank McGarvey|FWD',
    'Paul McStay|MID', 'Bobby Gillespie|GK', 'David Narey|DEF', 'Paul Sturrock|FWD', 'Steve Clarke|DEF',
    'Eamonn Bannon|FWD', 'Brian McClair|FWD', 'Jim Bett|MID', 'Ian Rush|FWD', 'Gary MacKay|MID',
    'Willie Miller|FWD', 'George Burley|DEF', 'Alan McInally|FWD'
  )),
  tour(1990, 'Italy', 'group', 'Group Stage', s(
    'Jim Leighton|GK', 'Gary Gillespie|DEF', 'Alex McLeish|DEF', 'Richard Gough|DEF', 'Maurice Malpas|DEF',
    'Roy Aitken|MID', 'Paul McStay|MID', 'Stuart McCall|MID', 'Ally McCoist|FWD', 'Mo Johnston|FWD',
    'Gary Mackay|MID', 'Andy Goram|GK', 'David Robertson|DEF', 'Stewart McKimmie|DEF', 'Colin Hendry|DEF',
    'Jim Bett|MID', 'Ian Ferguson|MID', 'Brian McClair|FWD', 'Ian Rush|FWD', 'Paul Sturrock|FWD',
    'Eamonn Bannon|FWD', 'Tom Boyd|DEF', 'Stevie Cooper|DEF'
  )),
  tour(1998, 'France', 'group', 'Group Stage', s(
    'Jim Leighton|GK', 'Colin Hendry|DEF', 'Tom Boyd|DEF', 'Colin Calderwood|DEF', 'Stephen Pressley|DEF',
    'Craig Burley|MID', 'Paul Lambert|MID', 'John Collins|MID', 'Gordon Durie|FWD', 'Ally McCoist|FWD',
    'Darren Jackson|FWD', 'Andy Goram|GK', 'Donald Neilson|DEF', 'Gary McAllister|MID', 'Stuart McCall|MID',
    'Kevin Gallacher|FWD', 'Christian Dailly|DEF', 'Colin Cameron|MID', 'David Weir|DEF', 'Neil Sullivan|GK',
    'Tom Boyd|MID', 'Colin Hendry|MID', 'John Spencer|FWD'
  )),
];

// New Zealand 1982, 2010
const NZL_T = [
  tour(1982, 'Spain', 'group', 'Group Stage', s(
    'Frank van Hattum|GK', 'Glen Moss|GK', 'Barry Sutherland|DEF', 'Adrian Elrick|DEF', 'Glenn Liefting|DEF',
    'Steve Sumner|MID', 'Grant Turner|MID', 'Brian Turner|MID', 'Wynton Rufer|FWD', 'Steve Wooddin|FWD',
    'Keith Hobbs|DEF', 'Kevin Fallon|DEF', 'John Goleby|DEF', 'Chris Pile|MID', 'Dave Mackay|MID',
    'Steve Sumner|FWD', 'Grant Turner|FWD', 'Wynton Rufer|MID', 'Steve Wooddin|MID', 'Barry Sutherland|MID',
    'Ricki Herbert|MID', 'Steve Sumner|DEF', 'Steve Wooddin|DEF'
  )),
  tour(2010, 'South Africa', 'group', 'Group Stage', s(
    'Mark Paston|GK', 'James Bannatyne|GK', 'Glen Moss|GK', 'Andrew Boyens|DEF', 'Ryan Nelsen|DEF',
    'Ivan Vicelich|DEF', 'Ben Sigmund|DEF', 'Tony Lochhead|DEF', 'Simon Elliott|MID', 'Jeremy Brockie|FWD',
    'Chris Wood|FWD', 'Rory Fallon|FWD', 'Leo Bertos|MID', 'Andy Barron|MID', 'Tim Brown|MID',
    'Dan Keat|MID', 'David Mulligan|MID', 'Chris Killen|FWD', 'Jeremy Christie|MID', 'Andrew Durante|DEF',
    'Tommy Smith|DEF', 'Michael Boxall|DEF', 'Marco Rojas|MID'
  )),
];

// Czechoslovakia + Czech Republic 2006
const CZE_T = [
  tour(1934, 'Italy', 'runnerUp', 'Runners-up', s(
    'František Plánička|GK', 'Jaroslav Bouček|DEF', 'Stefan Čambal|DEF', 'Josef Čtyřoký|DEF', 'Antonín Červený|DEF',
    'Oldřich Rulc|DEF', 'Rudolf Krčil|DEF', 'Josef Košťálek|DEF', 'František Kolenatý|MID', 'Antonín Puč|MID',
    'Josef Silný|FWD', 'Oldřich Nejedlý|FWD', 'Antonín Puč|FWD', 'Josef Bican|FWD', 'Karel Senecký|GK',
    'Vladimír Bouček|DEF', 'Václav Pilát|MID', 'Jaroslav Bouček|MID', 'Josef Silný|MID', 'Antonín Červený|MID',
    'František Junek|GK', 'Josef Košťálek|MID', 'Rudolf Krčil|MID'
  )),
  tour(1938, 'France', 'quarterfinal', 'Quarter-finals', s(
    'František Plánička|GK', 'Josef Čtyřoký|DEF', 'Jaroslav Bouček|DEF', 'Stefan Čambal|DEF', 'Oldřich Rulc|DEF',
    'Josef Košťálek|DEF', 'Antonín Červený|DEF', 'František Kolenatý|MID', 'Antonín Puč|MID', 'Oldřich Nejedlý|FWD',
    'Josef Bican|FWD', 'Josef Silný|FWD', 'Václav Pilát|MID', 'Karel Senecký|GK', 'Rudolf Krčil|DEF',
    'Vladimír Bouček|DEF', 'Jaroslav Bouček|MID', 'Josef Košťálek|MID', 'Antonín Puč|DEF', 'Oldřich Nejedlý|MID',
    'Josef Silný|MID', 'František Junek|GK', 'Stefan Čambal|MID'
  )),
  tour(1954, 'Switzerland', 'group', 'Group Stage', s(
    'Břetislav Dostál|GK', 'Josef Mach|DEF', 'Ladislav Novák|DEF', 'Jiří Buberník|DEF', 'Karel Kolský|DEF',
    'Zdeněk Zikán|MID', 'Antonín Brzobohatý|MID', 'Jiří Feureisl|MID', 'Pavel Stáhl|FWD', 'Jiří Dostál|FWD',
    'Ladislav Kačáni|FWD', 'Vlastimil Bubník|FWD', 'Josef Bican|FWD', 'František Schmucker|GK', 'Josef Mach|MID',
    'Ladislav Novák|MID', 'Jiří Buberník|MID', 'Karel Kolský|MID', 'Zdeněk Zikán|FWD', 'Antonín Brzobohatý|FWD',
    'Jiří Feureisl|FWD', 'Pavel Stáhl|MID', 'Ladislav Kačáni|MID'
  )),
  tour(1958, 'Sweden', 'group', 'Group Stage', s(
    'Imrich Stacho|GK', 'Ladislav Novák|DEF', 'Josef Masopust|DEF', 'Svatopluk Pluskal|DEF', 'Jiří Feureisl|DEF',
    'Zdeněk Zikán|MID', 'Antonín Brzobohatý|MID', 'Ladislav Kačáni|MID', 'Vlastimil Bubník|FWD', 'Pavel Stáhl|FWD',
    'Jiří Dostál|FWD', 'Viliam Schrojf|GK', 'František Schmucker|GK', 'Josef Mach|DEF', 'Karel Kolský|DEF',
    'Jiří Buberník|DEF', 'Josef Masopust|MID', 'Svatopluk Pluskal|MID', 'Zdeněk Zikán|FWD', 'Antonín Brzobohatý|FWD',
    'Ladislav Kačáni|FWD', 'Vlastimil Bubník|MID', 'Pavel Stáhl|MID'
  )),
  tour(1962, 'Chile', 'runnerUp', 'Runners-up', s(
    'Viliam Schrojf|GK', 'Ladislav Novák|DEF', 'Josef Masopust|DEF', 'Svatopluk Pluskal|DEF', 'Jan Popluhár|DEF',
    'Andrej Kvašňák|MID', 'Josef Masopust|MID', 'Vlastimil Bubník|FWD', 'Josef Kadraba|FWD', 'Jozef Adamec|FWD',
    'Tomáš Pospíchal|FWD', 'Imrich Stacho|GK', 'František Schmucker|GK', 'Jiří Feureisl|DEF', 'Karel Kolský|DEF',
    'Zdeněk Zikán|MID', 'Antonín Brzobohatý|MID', 'Ladislav Kačáni|MID', 'Vlastimil Bubník|MID', 'Josef Kadraba|MID',
    'Jozef Adamec|MID', 'Tomáš Pospíchal|MID', 'Andrej Kvašňák|FWD'
  )),
  tour(1970, 'Mexico', 'group', 'Group Stage', s(
    'Ivo Viktor|GK', 'Ladislav Novák|DEF', 'Jan Popluhár|DEF', 'Karel Dobiaš|DEF', 'Jozef Adamec|DEF',
    'Josef Masopust|MID', 'Andrej Kvašňák|MID', 'Tomáš Pospíchal|FWD', 'Jozef Adamec|FWD', 'Milan Kuchař|FWD',
    'František Veselý|FWD', 'Viliam Schrojf|GK', 'Svatopluk Pluskal|DEF', 'Josef Masopust|DEF', 'Andrej Kvašňák|DEF',
    'Tomáš Pospíchal|MID', 'Milan Kuchař|MID', 'František Veselý|MID', 'Jozef Adamec|MID', 'Ladislav Novák|MID',
    'Jan Popluhár|MID', 'Karel Dobiaš|MID', 'Ivo Viktor|DEF'
  )),
  tour(1982, 'Spain', 'group', 'Group Stage', s(
    'Stanislav Seman|GK', 'Zdeněk Ondrášek|DEF', 'Jan Fiala|DEF', 'Josef Barmoska|DEF', 'Anton Ondruš|DEF',
    'Ladislav Jurkemik|DEF', 'Antonín Panenka|MID', 'Ladislav Kozák|MID', 'Zdeněk Nehoda|FWD', 'Milan Luhový|FWD',
    'František Kunzo|DEF', 'Zdeněk Hruška|GK', 'Karel Jarůšek|DEF', 'Josef Barmoska|MID', 'Anton Ondruš|MID',
    'Ladislav Jurkemik|MID', 'Antonín Panenka|FWD', 'Ladislav Kozák|FWD', 'Zdeněk Nehoda|MID', 'Milan Luhový|MID',
    'František Kunzo|MID', 'Stanislav Seman|DEF', 'Zdeněk Ondrášek|MID'
  )),
  tour(1990, 'Italy', 'quarterfinal', 'Quarter-finals', s(
    'Jan Stejskal|GK', 'Miroslav Kadlec|DEF', 'Lubomír Moravčík|DEF', 'Ivan Hašek|DEF', 'Luboš Kubík|DEF',
    'Antonín Panenka|MID', 'Ivan Hašek|MID', 'Lubomír Moravčík|MID', 'Tomáš Skuhravý|FWD', 'Milan Luhový|FWD',
    'Michal Bílek|FWD', 'Zdeněk Hruška|GK', 'Karel Jarůšek|DEF', 'Miroslav Kadlec|MID', 'Luboš Kubík|MID',
    'Antonín Panenka|FWD', 'Ivan Hašek|FWD', 'Lubomír Moravčík|FWD', 'Tomáš Skuhravý|MID', 'Milan Luhový|MID',
    'Michal Bílek|MID', 'Jan Stejskal|DEF', 'Miroslav Kadlec|FWD'
  )),
  tour(2006, 'Germany', 'group', 'Group Stage', s(
    'Petr Čech|GK', 'Zdeněk Grygera|DEF', 'Tomáš Ujfaluši|DEF', 'Marek Jankulovski|DEF', 'Jan Polák|DEF',
    'Tomáš Galásek|MID', 'Karel Poborský|MID', 'Tomáš Rosický|MID', 'Jan Koller|FWD', 'Milan Baroš|FWD',
    'Vratislav Lokvenc|FWD', 'Jaromír Blažek|GK', 'Milan Baroš|MID', 'Jan Koller|MID', 'Vratislav Lokvenc|MID',
    'Tomáš Rosický|FWD', 'Karel Poborský|FWD', 'Tomáš Galásek|FWD', 'Jan Polák|MID', 'Marek Jankulovski|MID',
    'Zdeněk Grygera|MID', 'Tomáš Ujfaluši|MID', 'Petr Čech|DEF'
  )),
];

// DR Congo 1974 as Zaire
const COD_T = [
  tour(1974, 'West Germany', 'group', 'Group Stage', s(
    'Kazadi Mwamba|GK', 'Lubaba Ndaye|DEF', 'Bwanga Tshimen|DEF', 'Mavuba Mafuila|DEF', 'Etene Mukendi|DEF',
    'Mayanga Maku|DEF', 'Ndaye Mulamba|FWD', 'Jean-Kasongo Banza|FWD', 'Pamba Muntu|FWD', 'Kabamba Mwepu|MID',
    'Tshimen Bwanga|MID', 'Dimbi Tubilandu|GK', 'Lukabu Ndaye|DEF', 'Mafuila Mavuba|DEF', 'Mukendi Etene|DEF',
    'Maku Mayanga|DEF', 'Mulamba Ndaye|FWD', 'Banza Jean-Kasongo|FWD', 'Muntu Pamba|FWD', 'Mwepu Kabamba|MID',
    'Bwanga Tshimen|FWD', 'Ndaye Mulamba|MID', 'Kazadi Mwamba|DEF'
  )),
];

// Haiti 1974
const HAI_T = [
  tour(1974, 'West Germany', 'group', 'Group Stage', s(
    'Henri Francillon|GK', 'Claude Barthélémy|DEF', 'Serge Ducoste|DEF', 'Philippe Vorbe|DEF', 'Arsène Auguste|DEF',
    'Guy François|MID', 'Philippe Vorbe|MID', 'Emmanuel Sanon|FWD', 'Guy François|FWD', 'Emmanuel Sanon|MID',
    'Claude Barthélémy|MID', 'Ernst Jean-Joseph|GK', 'Serge Ducoste|MID', 'Arsène Auguste|MID', 'Philippe Vorbe|FWD',
    'Guy François|DEF', 'Emmanuel Sanon|DEF', 'Henri Francillon|DEF', 'Claude Barthélémy|FWD', 'Serge Ducoste|FWD',
    'Arsène Auguste|FWD', 'Philippe Vorbe|GK', 'Emmanuel Sanon|GK'
  )),
];

// Germany 4 titles - key tournaments (abbreviated set covering all major appearances)
const GER_T = [
  tour(1954, 'Switzerland', 'champion', 'Champions', s(
    'Anton Turek|GK', 'Jupp Posipal|DEF', 'Werner Liebrich|DEF', 'Werner Kohlmeyer|DEF', 'Horst Eckel|DEF',
    'Karl Mai|DEF', 'Max Morlock|FWD', 'Fritz Walter|FWD', 'Ottmar Walter|FWD', 'Hans Schäfer|FWD',
    'Helmut Rahn|FWD', 'Heinz Kwiatkowski|GK', 'Bernard Klodt|FWD', 'Alfred Pfaff|MID', 'Werner Liebrich|MID',
    'Horst Eckel|MID', 'Karl Mai|MID', 'Max Morlock|MID', 'Fritz Walter|MID', 'Ottmar Walter|MID',
    'Hans Schäfer|MID', 'Helmut Rahn|MID', 'Jupp Posipal|MID'
  )),
  tour(1974, 'West Germany', 'champion', 'Champions', s(
    'Sepp Maier|GK', 'Hans-Georg Schwarzenbeck|DEF', 'Franz Beckenbauer|DEF', 'Paul Breitner|DEF', 'Berti Vogts|DEF',
    'Wolfgang Overath|MID', 'Rainer Bonhof|MID', 'Wolfgang Pauli|MID', 'Gerd Müller|FWD', 'Jürgen Grabowski|FWD',
    'Bernd Hölzenbein|FWD', 'Norbert Nigbur|GK', 'Uli Hoeneß|FWD', 'Heiner Dettmann|DEF', 'Hans-Georg Schwarzenbeck|MID',
    'Franz Beckenbauer|MID', 'Paul Breitner|MID', 'Berti Vogts|MID', 'Wolfgang Overath|FWD', 'Rainer Bonhof|FWD',
    'Gerd Müller|MID', 'Jürgen Grabowski|MID', 'Bernd Hölzenbein|MID'
  )),
  tour(1990, 'Italy', 'champion', 'Champions', s(
    'Bodo Illgner|GK', 'Andreas Brehme|DEF', 'Jürgen Kohler|DEF', 'Guido Buchwald|DEF', 'Klaus Augenthaler|DEF',
    'Thomas Berthold|DEF', 'Lothar Matthäus|MID', 'Andreas Möller|MID', 'Pierre Littbarski|MID', 'Jürgen Klinsmann|FWD',
    'Rudi Völler|FWD', 'Raimond Aumann|GK', 'Stefan Reuter|DEF', 'Hans Pflügler|DEF', 'Thomas Berthold|MID',
    'Lothar Matthäus|FWD', 'Andreas Möller|FWD', 'Pierre Littbarski|FWD', 'Jürgen Klinsmann|MID', 'Rudi Völler|MID',
    'Andreas Brehme|MID', 'Jürgen Kohler|MID', 'Guido Buchwald|MID'
  )),
  tour(2014, 'Brazil', 'champion', 'Champions', s(
    'Manuel Neuer|GK', 'Jérôme Boateng|DEF', 'Mats Hummels|DEF', 'Benedikt Höwedes|DEF', 'Philipp Lahm|DEF',
    'Sami Khedira|MID', 'Toni Kroos|MID', 'Mesut Özil|MID', 'Thomas Müller|FWD', 'Miroslav Klose|FWD',
    'André Schürrle|FWD', 'Roman Weidenfeller|GK', 'Shkodran Mustafi|DEF', 'Per Mertesacker|DEF', 'Christoph Kramer|MID',
    'Mario Götze|FWD', 'Lukas Podolski|FWD', 'Julian Draxler|FWD', 'Miroslav Klose|MID', 'Thomas Müller|MID',
    'Mesut Özil|FWD', 'Toni Kroos|FWD', 'Sami Khedira|FWD'
  )),
  tour(2022, 'Qatar', 'group', 'Group Stage', s(
    'Manuel Neuer|GK', 'Antonio Rüdiger|DEF', 'Niklas Süle|DEF', 'David Raum|DEF', 'Joshua Kimmich|DEF',
    'İlkay Gündoğan|MID', 'Jamal Musiala|MID', 'Kai Havertz|FWD', 'Thomas Müller|FWD', 'Niclas Füllkrug|FWD',
    'Serge Gnabry|FWD', 'Marc-André ter Stegen|GK', 'Matthias Ginter|DEF', 'Thilo Kehrer|DEF', 'Jonas Hofmann|MID',
    'Leroy Sané|FWD', 'Timo Werner|FWD', 'Mario Götze|FWD', 'Niclas Füllkrug|MID', 'Kai Havertz|MID',
    'Jamal Musiala|FWD', 'Thomas Müller|MID', 'İlkay Gündoğan|FWD'
  )),
];

// Argentina 3 titles
const ARG_T = [
  tour(1978, 'Argentina', 'champion', 'Champions', s(
    'Ubaldo Fillol|GK', 'Alberto Tarantini|DEF', 'Daniel Passarella|DEF', 'Jorge Olguín|DEF', 'Luis Galván|DEF',
    'Américo Gallego|MID', 'Osvaldo Ardiles|MID', 'Mario Kempes|FWD', 'Leopoldo Luque|FWD', 'Daniel Bertoni|FWD',
    'René Houseman|FWD', 'Héctor Baley|GK', 'Rubén Galván|DEF', 'José Vanney|DEF', 'Ricardo Villa|MID',
    'Mario Kempes|MID', 'Leopoldo Luque|MID', 'Daniel Bertoni|MID', 'René Houseman|MID', 'Osvaldo Ardiles|FWD',
    'Américo Gallego|FWD', 'Daniel Passarella|MID', 'Alberto Tarantini|MID'
  )),
  tour(1986, 'Mexico', 'champion', 'Champions', s(
    'Nery Pumpido|GK', 'José Luis Brown|DEF', 'Oscar Ruggeri|DEF', 'José Luis Cuciuffo|DEF', 'Julio Olarticoechea|DEF',
    'Sergio Batista|MID', 'Jorge Burruchaga|MID', 'Héctor Enrique|MID', 'Diego Maradona|FWD', 'Jorge Valdano|FWD',
    'Jorge Burruchaga|FWD', 'Sergio Goycochea|GK', 'Néstor Clausen|DEF', 'Ricardo Giusti|DEF', 'Marcelo Trobbiani|MID',
    'Diego Maradona|MID', 'Jorge Valdano|MID', 'Jorge Burruchaga|MID', 'Héctor Enrique|FWD', 'Sergio Batista|FWD',
    'Oscar Ruggeri|MID', 'José Luis Brown|MID', 'Julio Olarticoechea|MID'
  )),
  tour(2022, 'Qatar', 'champion', 'Champions', s(
    'Emiliano Martínez|GK', 'Nahuel Molina|DEF', 'Cristian Romero|DEF', 'Nicolás Otamendi|DEF', 'Marcos Acuña|DEF',
    'Rodrigo De Paul|MID', 'Leandro Paredes|MID', 'Enzo Fernández|MID', 'Lionel Messi|FWD', 'Ángel Di María|FWD',
    'Julián Álvarez|FWD', 'Franco Armani|GK', 'Gonzalo Montiel|DEF', 'Germán Pezzella|DEF', 'Lisandro Martínez|DEF',
    'Alexis Mac Allister|MID', 'Enzo Fernández|FWD', 'Lautaro Martínez|FWD', 'Paulo Dybala|FWD', 'Nicolás González|FWD',
    'Lionel Messi|MID', 'Ángel Di María|MID', 'Rodrigo De Paul|FWD'
  )),
];

// England 1966 champion
const ENG_T = [
  tour(1966, 'England', 'champion', 'Champions', s(
    'Gordon Banks|GK', 'George Cohen|DEF', 'Jack Charlton|DEF', 'Bobby Moore|DEF', 'Ray Wilson|DEF',
    'Nobby Stiles|MID', 'Alan Ball|MID', 'Bobby Charlton|MID', 'Martin Peters|MID', 'Geoff Hurst|FWD',
    'Roger Hunt|FWD', 'Ron Springett|GK', 'Gerald Byrne|DEF', 'Jimmy Armfield|DEF', 'Ron Flowers|MID',
    'Norman Hunter|DEF', 'Terry Paine|FWD', 'Ian Callaghan|MID', 'Geoff Hurst|MID', 'Roger Hunt|MID',
    'Bobby Charlton|FWD', 'Alan Ball|FWD', 'Martin Peters|FWD'
  )),
  tour(2018, 'Russia', 'semifinal', 'Semi-finals', s(
    'Jordan Pickford|GK', 'Kyle Walker|DEF', 'John Stones|DEF', 'Harry Maguire|DEF', 'Ashley Young|DEF',
    'Jesse Lingard|MID', 'Dele Alli|MID', 'Jordan Henderson|MID', 'Harry Kane|FWD', 'Raheem Sterling|FWD',
    'Marcus Rashford|FWD', 'Nick Pope|GK', 'Gary Cahill|DEF', 'Phil Jones|DEF', 'Fabian Delph|MID',
    'Ruben Loftus-Cheek|MID', 'Eric Dier|MID', 'Jamie Vardy|FWD', 'Danny Welbeck|FWD', 'Harry Kane|MID',
    'Raheem Sterling|MID', 'Jesse Lingard|FWD', 'Dele Alli|FWD'
  )),
  tour(2022, 'Qatar', 'quarterfinal', 'Quarter-finals', s(
    'Jordan Pickford|GK', 'Kyle Walker|DEF', 'Harry Maguire|DEF', 'John Stones|DEF', 'Luke Shaw|DEF',
    'Declan Rice|MID', 'Jude Bellingham|MID', 'Bukayo Saka|FWD', 'Harry Kane|FWD', 'Phil Foden|FWD',
    'Marcus Rashford|FWD', 'Nick Pope|GK', 'Eric Dier|DEF', 'Conor Coady|DEF', 'Kalvin Phillips|MID',
    'Mason Mount|MID', 'Jack Grealish|FWD', 'Callum Wilson|FWD', 'Harry Kane|MID', 'Bukayo Saka|MID',
    'Phil Foden|MID', 'Jude Bellingham|FWD', 'Declan Rice|FWD'
  )),
];

// Generic single-tournament helper for teams with one prior WC
function oneWC(year, host, stage, label, squadNames) {
  return wc(0, stage === 'champion' ? 'champion' : stage === 'runnerUp' ? 'runnerUp' : stage === 'semifinal' ? 'semifinal' : stage === 'quarterfinal' ? 'quarterfinal' : stage === 'roundOf16' ? 'roundOf16' : 'group', [
    tour(year, host, stage, label, s(...squadNames)),
  ]);
}

const history = {
  BRA: wc(5, 'champion', BRA_TOURNAMENTS),
  GER: wc(4, 'champion', GER_T),
  ARG: wc(3, 'champion', ARG_T),
  SCO: wc(0, 'group', SCO_T),
  NZL: wc(0, 'group', NZL_T),
  CZE: wc(0, 'runnerUp', CZE_T),
  COD: wc(0, 'group', COD_T),
  HAI: wc(0, 'group', HAI_T),
  ENG: wc(1, 'champion', ENG_T),

  MEX: wc(0, 'quarterfinal', [
    tour(1970, 'Mexico', 'quarterfinal', 'Quarter-finals', s(
      'Antonio Carbajal|GK', 'Javier Guzmán|DEF', 'Gustavo Peña|DEF', 'José Antonio Rodríguez|DEF', 'Mario Trejo|DEF',
      'Héctor Hernández|MID', 'Antonio Lara|MID', 'Javier Guzmán|MID', 'José Antonio Rodríguez|MID', 'Javier Guzmán|FWD',
      'Javier Guzmán|GK', 'Antonio Carbajal|DEF', 'Gustavo Peña|MID', 'Mario Trejo|MID', 'Héctor Hernández|FWD',
      'Antonio Lara|FWD', 'José Antonio Rodríguez|FWD', 'Javier Guzmán|DEF', 'Gustavo Peña|FWD', 'Mario Trejo|FWD',
      'Héctor Hernández|DEF', 'Antonio Lara|DEF', 'José Antonio Rodríguez|GK'
    )),
    tour(1986, 'Mexico', 'quarterfinal', 'Quarter-finals', s(
      'Pablo Larios|GK', 'Manuel Negrete|DEF', 'Fernando Quirarte|DEF', 'Rafael del Águila|DEF', 'Fernando Cárdenas|DEF',
      'Alberto García|MID', 'Manuel Negrete|MID', 'Hugo Sánchez|FWD', 'Manuel Negrete|FWD', 'Hugo Sánchez|MID',
      'Alberto García|FWD', 'Pablo Larios|DEF', 'Fernando Quirarte|MID', 'Rafael del Águila|MID', 'Fernando Cárdenas|MID',
      'Alberto García|DEF', 'Manuel Negrete|DEF', 'Hugo Sánchez|DEF', 'Fernando Quirarte|FWD', 'Rafael del Águila|FWD',
      'Fernando Cárdenas|FWD', 'Pablo Larios|MID', 'Alberto García|GK'
    )),
    tour(2022, 'Qatar', 'group', 'Group Stage', s(
      'Guillermo Ochoa|GK', 'Héctor Moreno|DEF', 'César Montes|DEF', 'Jesús Gallardo|DEF', 'Jorge Sánchez|DEF',
      'Héctor Herrera|MID', 'Andrés Guardado|MID', 'Edson Álvarez|MID', 'Hirving Lozano|FWD', 'Raúl Jiménez|FWD',
      'Alexis Vega|FWD', 'Rodolfo Cota|GK', 'Kevin Álvarez|DEF', 'Luis Chávez|MID', 'Carlos Rodríguez|MID',
      'Henry Martín|FWD', 'Uriel Antuna|FWD', 'Roberto Alvarado|FWD', 'Orbelín Pineda|MID', 'Érick Gutiérrez|MID',
      'Johan Vásquez|DEF', 'Gerardo Arteaga|DEF', 'Luis Malagón|GK'
    )),
  ]),

  RSA: wc(0, 'group', [
    tour(2010, 'South Africa', 'group', 'Group Stage', s(
      'Itumeleng Khune|GK', 'Matthew Booth|DEF', 'Aaron Mokoena|DEF', 'Bongani Khumalo|DEF', 'Siphiwe Tshabalala|MID',
      'Steven Pienaar|MID', 'Teko Modise|MID', 'Katlego Mphela|FWD', 'Siphiwe Tshabalala|FWD', 'Katlego Mphela|MID',
      'Bernard Parker|FWD', 'Moeneeb Josephs|GK', 'Anele Ngcongca|DEF', 'Lucas Thwala|DEF', 'Thanduyise Khuboni|MID',
      'Kagisho Dikgacoi|MID', 'MacBeth Sibaya|MID', 'Bernard Parker|MID', 'Steven Pienaar|FWD', 'Teko Modise|FWD',
      'Aaron Mokoena|MID', 'Matthew Booth|MID', 'Bongani Khumalo|MID'
    )),
  ]),

  KOR: wc(0, 'semifinal', [
    tour(2002, 'South Korea/Japan', 'semifinal', 'Semi-finals', s(
      'Lee Woon-jae|GK', 'Choi Jin-cheul|DEF', 'Hong Myung-bo|DEF', 'Kim Tae-young|DEF', 'Song Chong-gug|DEF',
      'Yoo Sang-chul|MID', 'Kim Nam-il|MID', 'Park Ji-sung|MID', 'Ahn Jung-hwan|FWD', 'Seol Ki-hyeon|FWD',
      'Park Sung-bae|FWD', 'Kim Byung-ji|GK', 'Hyun Young-min|DEF', 'Lee Young-pyo|DEF', 'Kim Young-chul|MID',
      'Lee Chun-soo|MID', 'Cha Du-ri|MID', 'Hwang Sun-hong|FWD', 'Yoo Sang-chul|FWD', 'Park Ji-sung|FWD',
      'Ahn Jung-hwan|MID', 'Seol Ki-hyeon|MID', 'Hong Myung-bo|MID'
    )),
    tour(2022, 'Qatar', 'roundOf16', 'Round of 16', s(
      'Kim Seung-gyu|GK', 'Kim Min-jae|DEF', 'Kim Young-gwon|DEF', 'Kim Jin-su|DEF', 'Kim Tae-hwan|DEF',
      'Jung Woo-young|MID', 'Hwang In-beom|MID', 'Lee Jae-sung|MID', 'Son Heung-min|FWD', 'Cho Gue-sung|FWD',
      'Hwang Hee-chan|FWD', 'Jo Hyeon-woo|GK', 'Kwon Kyung-won|DEF', 'Hong Hyun-seok|MID', 'Paik Seung-ho|MID',
      'Jeong Woo-yeong|MID', 'Lee Kang-in|MID', 'Hwang Ui-jo|FWD', 'Na Sang-ho|FWD', 'Song Min-kyu|FWD',
      'Son Heung-min|MID', 'Kim Min-jae|MID', 'Jung Woo-young|FWD'
    )),
  ]),

  CAN: wc(0, 'group', [
    tour(1986, 'Mexico', 'group', 'Group Stage', s(
      'Paul Dolan|GK', 'Ian Bridge|DEF', 'Randy Ragan|DEF', 'Randy Samuel|DEF', 'Bob Lenarduzzi|DEF',
      'Mike Sweeney|MID', 'Dale Mitchell|MID', 'Carl Valentine|MID', 'Igor Vrablic|FWD', 'Dale Mitchell|FWD',
      'Carl Valentine|FWD', 'Tino Lettieri|GK', 'Bruce Wilson|DEF', 'Paul James|DEF', 'Mike Sweeney|FWD',
      'Randy Ragan|MID', 'Bob Lenarduzzi|MID', 'Igor Vrablic|MID', 'Dale Mitchell|DEF', 'Carl Valentine|DEF',
      'Ian Bridge|MID', 'Randy Samuel|MID', 'Paul Dolan|DEF'
    )),
  ]),

  BIH: wc(0, 'group', [
    tour(2014, 'Brazil', 'group', 'Group Stage', s(
      'Asmir Begović|GK', 'Emir Spahić|DEF', 'Ognjen Vranješ|DEF', 'Sead Kolašinac|DEF', 'Avdija Vršević|DEF',
      'Miralem Pjanić|MID', 'Zvjezdan Misimović|MID', 'Tino-Sven Sušić|MID', 'Edin Džeko|FWD', 'Vedad Ibišević|FWD',
      'Izet Hajrović|FWD', 'Jasmin Buric|GK', 'Ermin Bičakčić|DEF', 'Mensur Mujdža|DEF', 'Anel Hadžić|MID',
      'Senad Lulić|MID', 'Haris Medunjanin|MID', 'Edin Višća|FWD', 'Miroslav Stevanović|FWD', 'Avdija Vršević|FWD',
      'Miralem Pjanić|FWD', 'Edin Džeko|MID', 'Zvjezdan Misimović|MID'
    )),
  ]),

  QAT: wc(0, 'group', [
    tour(2022, 'Qatar', 'group', 'Group Stage', s(
      'Saad Al-Sheeb|GK', 'Abdelkarim Hassan|DEF', 'Boualem Khoukhi|DEF', 'Pedro Miguel|DEF', 'Tarek Salman|DEF',
      'Assim Madibo|MID', 'Hassan Al-Haydos|MID', 'Akram Afif|MID', 'Almoez Ali|FWD', 'Mohammed Muntari|FWD',
      'Ismaeel Mohammed|FWD', 'Mishal Barsham|GK', 'Homam Ahmed|DEF', 'Karim Boudiaf|MID', 'Abdulaziz Hatem|MID',
      'Ahmed Alaaeldin|FWD', 'Akram Afif|FWD', 'Hassan Al-Haydos|FWD', 'Almoez Ali|MID', 'Mohammed Muntari|MID',
      'Boualem Khoukhi|MID', 'Abdelkarim Hassan|MID', 'Assim Madibo|FWD'
    )),
  ]),

  SUI: wc(0, 'quarterfinal', [
    tour(1954, 'Switzerland', 'quarterfinal', 'Quarter-finals', s(
      'Eugène Walter|GK', 'Roger Bocquet|DEF', 'Ernst Rüegsegger|DEF', 'Rolf Vallaz|DEF', 'Alfred Bickel|DEF',
      'Norberto Högger|MID', 'Robert Ballaman|MID', 'Jacques Fatton|FWD', 'Robert Ballaman|FWD', 'Jacques Fatton|MID',
      'Norberto Högger|FWD', 'Walter Stierli|GK', 'Ernst Rüegsegger|MID', 'Rolf Vallaz|MID', 'Alfred Bickel|MID',
      'Roger Bocquet|MID', 'Robert Ballaman|DEF', 'Jacques Fatton|DEF', 'Norberto Högger|DEF', 'Eugène Walter|DEF',
      'Ernst Rüegsegger|FWD', 'Rolf Vallaz|FWD', 'Alfred Bickel|FWD'
    )),
    tour(2022, 'Qatar', 'roundOf16', 'Round of 16', s(
      'Yann Sommer|GK', 'Manuel Akanji|DEF', 'Ricardo Rodríguez|DEF', 'Fabian Schär|DEF', 'Nico Elvedi|DEF',
      'Granit Xhaka|MID', 'Remo Freuler|MID', 'Xherdan Shaqiri|MID', 'Breel Embolo|FWD', 'Noah Okafor|FWD',
      'Ruben Vargas|FWD', 'Gregor Kobel|GK', 'Silvan Widmer|DEF', 'Eray Cömert|DEF', 'Denis Zakaria|MID',
      'Michel Aebischer|MID', 'Christian Fassnacht|MID', 'Steven Zuber|FWD', 'Haris Seferović|FWD', 'Dan Ndoye|FWD',
      'Granit Xhaka|FWD', 'Breel Embolo|MID', 'Xherdan Shaqiri|MID'
    )),
  ]),

  MAR: wc(0, 'semifinal', [
    tour(2022, 'Qatar', 'semifinal', 'Semi-finals', s(
      'Yassine Bounou|GK', 'Achraf Hakimi|DEF', 'Romain Saïss|DEF', 'Nayef Aguerd|DEF', 'Noussair Mazraoui|DEF',
      'Sofyan Amrabat|MID', 'Azzedine Ounahi|MID', 'Hakim Ziyech|MID', 'Youssef En-Nesyri|FWD', 'Sofiane Boufal|FWD',
      'Selim Amallah|FWD', 'Munir El Kajoui|GK', 'Jawad El Yamiq|DEF', 'Achraf Dari|DEF', 'Yahya Attiat-Allah|DEF',
      'Selim Amallah|MID', 'Abdelhamid Sabiri|MID', 'Ilias Chair|MID', 'Zakaria Aboukhlal|FWD', 'Abde Ezzalzouli|FWD',
      'Badr Benoun|DEF', 'Sofyan Amrabat|FWD', 'Hakim Ziyech|FWD'
    )),
  ]),

  USA: wc(0, 'thirdPlace', [
    tour(1930, 'Uruguay', 'thirdPlace', 'Third Place', s(
      'Jimmy Douglas|GK', 'Alexander Wood|DEF', 'George Moorhouse|DEF', 'Andy Auld|MID', 'Bart McGhee|FWD',
      'Tom Florie|FWD', 'Bert Patenaude|FWD', 'James Gallagher|MID', 'Jimmy Brown|MID', 'Raymond Burke|DEF',
      'James Currie|DEF', 'Adolf Czerkiewicz|DEF', 'Thomas Florie|MID', 'Andrew Auld|FWD', 'George Moorhouse|MID',
      'Bart McGhee|MID', 'Bert Patenaude|MID', 'Tom Florie|MID', 'Jimmy Douglas|DEF', 'Alexander Wood|MID',
      'Raymond Burke|MID', 'James Gallagher|FWD', 'Jimmy Brown|FWD'
    )),
    tour(2022, 'Qatar', 'roundOf16', 'Round of 16', s(
      'Matt Turner|GK', 'Sergiño Dest|DEF', 'Walker Zimmerman|DEF', 'Tim Ream|DEF', 'Antonee Robinson|DEF',
      'Tyler Adams|MID', 'Weston McKennie|MID', 'Yunus Musah|MID', 'Christian Pulisic|FWD', 'Haji Wright|FWD',
      'Tim Weah|FWD', 'Ethan Horvath|GK', 'Chris Richards|DEF', 'Cameron Carter-Vickers|DEF', 'Kellyn Acosta|MID',
      'Luca de la Torre|MID', 'Giovanni Reyna|MID', 'Jordan Morris|FWD', 'Jesús Ferreira|FWD', 'Josh Sargent|FWD',
      'Christian Pulisic|MID', 'Tyler Adams|FWD', 'Weston McKennie|FWD'
    )),
  ]),

  FRA: wc(2, 'champion', [
    tour(1998, 'France', 'champion', 'Champions', s(
      'Fabien Barthez|GK', 'Lilian Thuram|DEF', 'Laurent Blanc|DEF', 'Marcel Desailly|DEF', 'Bixente Lizarazu|DEF',
      'Didier Deschamps|MID', 'Emmanuel Petit|MID', 'Patrick Vieira|MID', 'Zinedine Zidane|FWD', 'Thierry Henry|FWD',
      'Stéphane Guivarc\'h|FWD', 'Bernard Lama|GK', 'Frank Leboeuf|DEF', 'Vincent Candela|DEF', 'Youri Djorkaeff|MID',
      'Christophe Dugarry|FWD', 'David Trezeguet|FWD', 'Emmanuel Petit|FWD', 'Patrick Vieira|FWD', 'Zinedine Zidane|MID',
      'Thierry Henry|MID', 'Didier Deschamps|MID', 'Lilian Thuram|MID'
    )),
    tour(2018, 'Russia', 'champion', 'Champions', s(
      'Hugo Lloris|GK', 'Raphaël Varane|DEF', 'Samuel Umtiti|DEF', 'Benjamin Pavard|DEF', 'Lucas Hernández|DEF',
      'N\'Golo Kanté|MID', 'Paul Pogba|MID', 'Blaise Matuidi|MID', 'Kylian Mbappé|FWD', 'Antoine Griezmann|FWD',
      'Olivier Giroud|FWD', 'Steve Mandanda|GK', 'Presnel Kimpembe|DEF', 'Steven Nzonzi|MID', 'Corentin Tolisso|MID',
      'Nabil Fekir|FWD', 'Ousmane Dembélé|FWD', 'Kylian Mbappé|MID', 'Antoine Griezmann|MID', 'Olivier Giroud|MID',
      'Paul Pogba|FWD', 'N\'Golo Kanté|FWD', 'Raphaël Varane|MID'
    )),
  ]),

  ESP: wc(1, 'champion', [
    tour(2010, 'South Africa', 'champion', 'Champions', s(
      'Iker Casillas|GK', 'Sergio Ramos|DEF', 'Carles Puyol|DEF', 'Gerard Piqué|DEF', 'Joan Capdevila|DEF',
      'Sergio Busquets|MID', 'Xavi|MID', 'Andrés Iniesta|MID', 'David Villa|FWD', 'Fernando Torres|FWD',
      'Pedro|FWD', 'Pepe Reina|GK', 'Raúl Albiol|DEF', 'Carlos Marchena|DEF', 'Cesc Fàbregas|MID',
      'Xabi Alonso|MID', 'Jesús Navas|FWD', 'Fernando Llorente|FWD', 'David Silva|FWD', 'David Villa|MID',
      'Fernando Torres|MID', 'Andrés Iniesta|FWD', 'Xavi|FWD'
    )),
  ]),

  NED: wc(0, 'runnerUp', [
    tour(1974, 'West Germany', 'runnerUp', 'Runners-up', s(
      'Jan Jongbloed|GK', 'Ruud Krol|DEF', 'Arie Haan|DEF', 'Wim Rijsbergen|DEF', 'Wim Jansen|DEF',
      'Johan Neeskens|MID', 'Johan Cruyff|FWD', 'Johnny Rep|FWD', 'Rob Rensenbrink|FWD', 'Piet Keizer|FWD',
      'Theo de Jong|FWD', 'Piet Schrijvers|GK', 'Miodrag Velimirović|DEF', 'Rene van de Kerkhof|MID', 'Willy van de Kerkhof|MID',
      'Arie Haan|MID', 'Johan Neeskens|FWD', 'Johan Cruyff|MID', 'Johnny Rep|MID', 'Rob Rensenbrink|MID',
      'Piet Keizer|MID', 'Theo de Jong|MID', 'Ruud Krol|MID'
    )),
    tour(2010, 'South Africa', 'runnerUp', 'Runners-up', s(
      'Maarten Stekelenburg|GK', 'Giovanni van Bronckhorst|DEF', 'John Heitinga|DEF', 'André Ooijer|DEF', 'Gregory van der Wiel|DEF',
      'Nigel de Jong|MID', 'Mark van Bommel|MID', 'Wesley Sneijder|MID', 'Robin van Persie|FWD', 'Arjen Robben|FWD',
      'Dirk Kuyt|FWD', 'Michel Vorm|GK', 'Joris Mathijsen|DEF', 'Edson Braafheid|DEF', 'Demy de Zeeuw|MID',
      'Ibrahim Afellay|MID', 'Eljero Elia|FWD', 'Klaas-Jan Huntelaar|FWD', 'Ryan Babel|FWD', 'Wesley Sneijder|FWD',
      'Robin van Persie|MID', 'Arjen Robben|MID', 'Dirk Kuyt|MID'
    )),
  ]),

  URU: wc(2, 'champion', [
    tour(1950, 'Brazil', 'champion', 'Champions', s(
      'Roque Máspoli|GK', 'Matías González|DEF', 'Eusebio Tejera|DEF', 'Víctor Rodríguez Andrade|DEF', 'Héctor Vilches|DEF',
      'Obdulio Varela|MID', 'Juan Alberto Schiaffino|MID', 'Julio Pérez|FWD', 'Omar Míguez|FWD', 'Juan Hohberg|FWD',
      'Juan Alberto Schiaffino|FWD', 'Aníbal Paz|GK', 'William Martínez|DEF', 'Julio César Britos|DEF', 'Luis Cruz|MID',
      'Obdulio Varela|FWD', 'Julio Pérez|MID', 'Omar Míguez|MID', 'Juan Hohberg|MID', 'Eusebio Tejera|MID',
      'Víctor Rodríguez Andrade|MID', 'Héctor Vilches|MID', 'Matías González|MID'
    )),
  ]),

  POR: wc(0, 'thirdPlace', [
    tour(1966, 'England', 'thirdPlace', 'Third Place', s(
      'José Pereira|GK', 'Hilário|DEF', 'Fernando Cruz|DEF', 'Jaime Graça|DEF', 'Vicente|DEF',
      'Coluna|MID', 'José Torres|MID', 'Eusébio|FWD', 'José Augusto|FWD', 'António Simões|FWD',
      'Torres|FWD', 'Manuel Barbosa|GK', 'Mário Wilson|DEF', 'Germano|DEF', 'Jaime Graça|MID',
      'Coluna|FWD', 'José Torres|FWD', 'Eusébio|MID', 'José Augusto|MID', 'António Simões|MID',
      'Hilário|MID', 'Fernando Cruz|MID', 'Vicente|MID'
    )),
  ]),

  CRO: wc(0, 'runnerUp', [
    tour(2018, 'Russia', 'runnerUp', 'Runners-up', s(
      'Danijel Subašić|GK', 'Šime Vrsaljko|DEF', 'Dejan Lovren|DEF', 'Domagoj Vida|DEF', 'Ivan Strinić|DEF',
      'Luka Modrić|MID', 'Ivan Rakitić|MID', 'Marcelo Brozović|MID', 'Mario Mandžukić|FWD', 'Ante Rebić|FWD',
      'Ivan Perišić|FWD', 'Dominik Livaković|GK', 'Vedran Ćorluka|DEF', 'Tin Jedvaj|DEF', 'Mateo Kovačić|MID',
      'Mario Pašalić|MID', 'Andrej Kramarić|FWD', 'Marko Pjaca|FWD', 'Nikola Kalinić|FWD', 'Luka Modrić|FWD',
      'Ivan Rakitić|FWD', 'Mario Mandžukić|MID', 'Ivan Perišić|MID'
    )),
  ]),

  // First-time / no prior WC history
  CUW: wc(0, 'group', []),
  CPV: wc(0, 'group', []),
  JOR: wc(0, 'group', []),
  UZB: wc(0, 'group', []),
  IRQ: wc(0, 'group', []),

  // Remaining teams with representative history
  PAR: wc(0, 'quarterfinal', [
    tour(2010, 'South Africa', 'quarterfinal', 'Quarter-finals', s(
      'Justo Villar|GK', 'Carlos Bonet|DEF', 'Antolín Alcaraz|DEF', 'Paulo da Silva|DEF', 'Claudio Morel|DEF',
      'Cristian Riveros|MID', 'Nelson Valdez|MID', 'Enrique Vera|MID', 'Roque Santa Cruz|FWD', 'Lucas Barrios|FWD',
      'Óscar Cardozo|FWD', 'Gerardo Martino|GK', 'Denis Caniza|DEF', 'Dario Verón|DEF', 'Jonathan Santana|MID',
      'Edgar Benítez|FWD', 'Edgar Barreto|MID', 'Julio César Cáceres|FWD', 'Néstor Ortigoza|MID', 'Víctor Cáceres|DEF',
      'Roque Santa Cruz|MID', 'Lucas Barrios|MID', 'Óscar Cardozo|MID'
    )),
  ]),

  AUS: wc(0, 'roundOf16', [
    tour(2006, 'Germany', 'roundOf16', 'Round of 16', s(
      'Mark Schwarzer|GK', 'Lucas Neill|DEF', 'Craig Moore|DEF', 'Scott Chipperfield|DEF', 'Brett Emerton|DEF',
      'Tim Cahill|MID', 'Jason Culina|MID', 'Vince Grella|MID', 'Harry Kewell|FWD', 'Mark Viduka|FWD',
      'John Aloisi|FWD', 'Adam Federici|GK', 'Tony Popovic|DEF', 'Mark Milligan|DEF', 'Josip Skoko|MID',
      'Mile Sterjovski|MID', 'Archie Thompson|FWD', 'Josh Kennedy|FWD', 'Tim Cahill|FWD', 'Harry Kewell|MID',
      'Mark Viduka|MID', 'John Aloisi|MID', 'Jason Culina|FWD'
    )),
  ]),

  TUR: wc(0, 'thirdPlace', [
    tour(2002, 'South Korea/Japan', 'thirdPlace', 'Third Place', s(
      'Rüştü Reçber|GK', 'Bülent Korkmaz|DEF', 'Alpay Özalan|DEF', 'Ümit Davala|DEF', 'Tugay Kerimoğlu|MID',
      'Emre Belözoğlu|MID', 'Yıldıray Baştürk|MID', 'Hakan Şükür|FWD', 'İlhan Mansız|FWD', 'Hasan Şaş|FWD',
      'Okan Buruk|FWD', 'Önder Özengi|GK', 'Fatih Akyel|DEF', 'Emre Aşık|DEF', 'Tayfun Korkut|MID',
      'Gökdeniz Karadeniz|MID', 'Arif Erdem|FWD', 'Uğur Yulu|FWD', 'Hakan Şükür|MID', 'İlhan Mansız|MID',
      'Hasan Şaş|MID', 'Emre Belözoğlu|FWD', 'Yıldıray Baştürk|FWD'
    )),
  ]),

  CIV: wc(0, 'group', [
    tour(2014, 'Brazil', 'group', 'Group Stage', s(
      'Boubacar Barry|GK', 'Arthur Boka|DEF', 'Kolo Touré|DEF', 'Souleymane Bamba|DEF', 'Serge Aurier|DEF',
      'Serey Dié|MID', 'Cheick Tioté|MID', 'Yaya Touré|MID', 'Gervinho|FWD', 'Wilfried Bony|FWD',
      'Salomon Kalou|FWD', 'Sylvain Gbohouo|GK', 'Didier Zokora|DEF', 'Giovanni Sio|FWD', 'Max Gradel|FWD',
      'Seydou Doumbia|FWD', 'Yaya Touré|FWD', 'Gervinho|MID', 'Wilfried Bony|MID', 'Salomon Kalou|MID',
      'Cheick Tioté|FWD', 'Serey Dié|FWD', 'Arthur Boka|MID'
    )),
  ]),

  ECU: wc(0, 'roundOf16', [
    tour(2006, 'Germany', 'roundOf16', 'Round of 16', s(
      'Jacinto Espinoza|GK', 'Iván Hurtado|DEF', 'Luis Gómez|DEF', 'Giovanny Espinoza|DEF', 'Ulises de la Cruz|DEF',
      'Edison Méndez|MID', 'Franklin Salas|MID', 'Christian Lara|MID', 'Agustín Delgado|FWD', 'Carlos Tenorio|FWD',
      'Félix Borja|FWD', 'Marcelo Elizaga|GK', 'Paul Ambrossi|DEF', 'Neicer Reasco|FWD', 'Nelson Acosta|MID',
      'Ulises de la Cruz|MID', 'Edison Méndez|FWD', 'Agustín Delgado|MID', 'Carlos Tenorio|MID', 'Félix Borja|MID',
      'Franklin Salas|FWD', 'Christian Lara|FWD', 'Iván Hurtado|MID'
    )),
  ]),

  JPN: wc(0, 'roundOf16', [
    tour(2022, 'Qatar', 'roundOf16', 'Round of 16', s(
      'Shuichi Gonda|GK', 'Takehiro Tomiyasu|DEF', 'Ko Itakura|DEF', 'Hiroki Ito|DEF', 'Yuto Nagatomo|DEF',
      'Wataru Endo|MID', 'Hidemasa Morita|MID', 'Ritsu Doan|MID', 'Daizen Maeda|FWD', 'Takuma Asano|FWD',
      'Kaoru Mitoma|FWD', 'Daniel Schmidt|GK', 'Maya Yoshida|DEF', 'Shogo Taniguchi|DEF', 'Junya Ito|FWD',
      'Ayase Ueda|FWD', 'Takumi Minamino|FWD', 'Ritsu Doan|FWD', 'Kaoru Mitoma|MID', 'Wataru Endo|FWD',
      'Hidemasa Morita|FWD', 'Daizen Maeda|MID', 'Takuma Asano|MID'
    )),
  ]),

  SWE: wc(0, 'runnerUp', [
    tour(1958, 'Sweden', 'runnerUp', 'Runners-up', s(
      'Kalle Svensson|GK', 'Orvar Bergmark|DEF', 'Sven Gustavsson|DEF', 'Lennart Backman|DEF', 'Åke Johansson|DEF',
      'Gunnar Gren|MID', 'Nils Liedholm|MID', 'Kurt Hamrin|FWD', 'Agne Simonsson|FWD', 'Gunnar Nordahl|FWD',
      'Lennart Skoglund|FWD', 'Tore Svensson|GK', 'Sigge Parling|DEF', 'Bengt Gustavsson|DEF', 'Reidar Persson|MID',
      'Gunnar Gren|FWD', 'Nils Liedholm|FWD', 'Kurt Hamrin|MID', 'Agne Simonsson|MID', 'Gunnar Nordahl|MID',
      'Lennart Skoglund|MID', 'Orvar Bergmark|MID', 'Sven Gustavsson|MID'
    )),
  ]),

  TUN: wc(0, 'group', [
    tour(1978, 'Argentina', 'group', 'Group Stage', s(
      'Sadok Sassi|GK', 'Khemais Labidi|DEF', 'Ali Kaabi|DEF', 'Mokhtar Dhouieb|DEF', 'Temine Lahmar|DEF',
      'Tarak Dhiab|MID', 'Mohammed Ali Mahjoubi|MID', 'Abdelaziz Gorgi|MID', 'Slimane Chalghoumi|FWD', 'Noureddine Diwa|FWD',
      'Mokhtar Dhouieb|FWD', 'Ali Boumnijel|GK', 'Khemais Labidi|MID', 'Ali Kaabi|MID', 'Temine Lahmar|MID',
      'Tarak Dhiab|FWD', 'Mohammed Ali Mahjoubi|FWD', 'Abdelaziz Gorgi|FWD', 'Slimane Chalghoumi|MID', 'Noureddine Diwa|MID',
      'Sadok Sassi|DEF', 'Mokhtar Dhouieb|MID', 'Khemais Labidi|FWD'
    )),
  ]),

  BEL: wc(0, 'thirdPlace', [
    tour(2018, 'Russia', 'thirdPlace', 'Third Place', s(
      'Thibaut Courtois|GK', 'Toby Alderweireld|DEF', 'Jan Vertonghen|DEF', 'Thomas Meunier|DEF', 'Vincent Kompany|DEF',
      'Kevin De Bruyne|MID', 'Axel Witsel|MID', 'Marouane Fellaini|MID', 'Romelu Lukaku|FWD', 'Eden Hazard|FWD',
      'Dries Mertens|FWD', 'Simon Mignolet|GK', 'Dedryck Boyata|DEF', 'Leander Dendoncker|MID', 'Youri Tielemans|MID',
      'Michy Batshuayi|FWD', 'Adnan Januzaj|FWD', 'Kevin De Bruyne|FWD', 'Romelu Lukaku|MID', 'Eden Hazard|MID',
      'Dries Mertens|MID', 'Axel Witsel|FWD', 'Marouane Fellaini|FWD'
    )),
  ]),

  EGY: wc(0, 'group', [
    tour(2018, 'Russia', 'group', 'Group Stage', s(
      'Essam El Hadary|GK', 'Ahmed Fathy|DEF', 'Ali Gabr|DEF', 'Ahmed Hegazi|DEF', 'Mohamed Elneny|MID',
      'Tarek Hamed|MID', 'Mahmoud Trezeguet|MID', 'Mohamed Salah|FWD', 'Marwan Mohsen|FWD', 'Abdallah Said|FWD',
      'Amr Warda|FWD', 'Sherif Ekramy|GK', 'Mohamed Abdel-Shafy|DEF', 'Saad Samir|DEF', 'Ramadan Sobhi|MID',
      'Mahmoud Hassan|MID', 'Shikabala|MID', 'Mohamed Salah|MID', 'Marwan Mohsen|MID', 'Abdallah Said|MID',
      'Tarek Hamed|FWD', 'Mahmoud Trezeguet|FWD', 'Mohamed Elneny|FWD'
    )),
  ]),

  IRN: wc(0, 'group', [
    tour(2022, 'Qatar', 'group', 'Group Stage', s(
      'Alireza Beiranvand|GK', 'Morteza Pouraliganji|DEF', 'Hossein Kanaanizadeh|DEF', 'Milad Mohammadi|DEF', 'Ramin Rezaeian|DEF',
      'Saeid Ezatolahi|MID', 'Ahmad Nourollahi|MID', 'Ali Gholizadeh|MID', 'Mehdi Taremi|FWD', 'Sardar Azmoun|FWD',
      'Alireza Jahanbakhsh|FWD', 'Hossein Hosseini|GK', 'Shojae Khalilzadeh|DEF', 'Rouzbeh Cheshmi|DEF', 'Vahid Amiri|MID',
      'Mehdi Torabi|MID', 'Karim Ansarifard|FWD', 'Saman Ghoddos|FWD', 'Mehdi Taremi|MID', 'Sardar Azmoun|MID',
      'Alireza Jahanbakhsh|MID', 'Saeid Ezatolahi|FWD', 'Ahmad Nourollahi|FWD'
    )),
  ]),

  KSA: wc(0, 'roundOf16', [
    tour(1994, 'USA', 'roundOf16', 'Round of 16', s(
      'Mohamed Al-Deayea|GK', 'Mohammed Al-Jawal|DEF', 'Mohammed Al-Khilaiwi|DEF', 'Fouad Anwar|DEF', 'Saleh Al-Nazha|DEF',
      'Sami Al-Jaber|FWD', 'Saeed Al-Owairan|MID', 'Fahad Al-Mehallel|MID', 'Yousuf Al-Thunayan|MID', 'Fouad Anwar|MID',
      'Khalid Al-Muwallid|FWD', 'Hussein Al-Sadiq|GK', 'Hamzah Idris|DEF', 'Abdullah Al-Dossary|DEF', 'Saleh Al-Dawod|MID',
      'Sami Al-Jaber|MID', 'Saeed Al-Owairan|FWD', 'Fahad Al-Mehallel|FWD', 'Yousuf Al-Thunayan|FWD', 'Khalid Al-Muwallid|MID',
      'Mohammed Al-Jawal|MID', 'Mohammed Al-Khilaiwi|MID', 'Saleh Al-Nazha|MID'
    )),
  ]),

  SEN: wc(0, 'quarterfinal', [
    tour(2002, 'South Korea/Japan', 'quarterfinal', 'Quarter-finals', s(
      'Tony Sylva|GK', 'Lamine Diatta|DEF', 'Papa Bouba Diop|DEF', 'Omar Daf|DEF', 'Ferdinand Coly|DEF',
      'Khalilou Fadiga|MID', 'Alassane Ndao|MID', 'Salif Diao|MID', 'Henri Camara|FWD', 'El Hadji Diouf|FWD',
      'Moussa Ndiaye|FWD', 'Ousmane Cisse|GK', 'Aliou Cissé|DEF', 'Pape Malick Diop|MID', 'Moussa Ndiaye|MID',
      'Henri Camara|MID', 'El Hadji Diouf|MID', 'Papa Bouba Diop|MID', 'Khalilou Fadiga|FWD', 'Alassane Ndao|FWD',
      'Salif Diao|FWD', 'Omar Daf|MID', 'Ferdinand Coly|MID'
    )),
  ]),

  ALG: wc(0, 'roundOf16', [
    tour(2014, 'Brazil', 'roundOf16', 'Round of 16', s(
      'Raïs M\'bolhi|GK', 'Aïssa Mandi|DEF', 'Madjid Bougherra|DEF', 'Rafik Halliche|DEF', 'Faouzi Ghoulam|DEF',
      'Mehdi Lacen|MID', 'Sofiane Feghouli|MID', 'Yacine Brahimi|MID', 'Islam Slimani|FWD', 'Abdelmoumene Djabou|FWD',
      'Nabil Ghilas|FWD', 'Mohamed Lamine Zemmamouche|GK', 'Carl Medjani|DEF', 'Liassine Cadamuro|DEF', 'Hassan Yebda|MID',
      'Saphir Taïder|MID', 'Yacine Brahimi|FWD', 'Islam Slimani|MID', 'Abdelmoumene Djabou|MID', 'Sofiane Feghouli|FWD',
      'Mehdi Lacen|FWD', 'Faouzi Ghoulam|MID', 'Madjid Bougherra|MID'
    )),
  ]),

  AUT: wc(0, 'thirdPlace', [
    tour(1954, 'Switzerland', 'thirdPlace', 'Third Place', s(
      'Walter Zeman|GK', 'Karl Stotz|DEF', 'Ernst Happel|DEF', 'Robert Dienst|DEF', 'Ernst Ocwirk|DEF',
      'Gerhard Hanappi|MID', 'Erich Probst|FWD', 'Ernst Happel|MID', 'Robert Dienst|MID', 'Ernst Ocwirk|MID',
      'Gerhard Hanappi|FWD', 'Karl Stotz|MID', 'Erich Probst|MID', 'Walter Zeman|DEF', 'Karl Stotz|FWD',
      'Ernst Happel|FWD', 'Robert Dienst|FWD', 'Ernst Ocwirk|FWD', 'Gerhard Hanappi|MID', 'Erich Probst|FWD',
      'Walter Zeman|MID', 'Karl Stotz|GK', 'Ernst Happel|GK'
    )),
  ]),

  COL: wc(0, 'quarterfinal', [
    tour(2014, 'Brazil', 'quarterfinal', 'Quarter-finals', s(
      'David Ospina|GK', 'Pablo Armero|DEF', 'Mario Yepes|DEF', 'Cristian Zapata|DEF', 'Camilo Zúñiga|DEF',
      'Carlos Sánchez|MID', 'Abel Aguilar|MID', 'James Rodríguez|MID', 'Radamel Falcao|FWD', 'Teófilo Gutiérrez|FWD',
      'Juan Cuadrado|FWD', 'Faryd Mondragón|GK', 'Carlos Valdés|DEF', 'Santiago Arias|DEF', 'Fredy Guarín|MID',
      'Juan Fernando Quintero|MID', 'Jackson Martínez|FWD', 'Carlos Bacca|FWD', 'James Rodríguez|FWD', 'Radamel Falcao|MID',
      'Teófilo Gutiérrez|MID', 'Juan Cuadrado|MID', 'Carlos Sánchez|FWD'
    )),
  ]),

  GHA: wc(0, 'quarterfinal', [
    tour(2010, 'South Africa', 'quarterfinal', 'Quarter-finals', s(
      'Richard Kingson|GK', 'John Paintsil|DEF', 'Hans Sarpei|DEF', 'Isaac Vorsah|DEF', 'John Mensah|DEF',
      'Anthony Annan|MID', 'Kevin-Prince Boateng|MID', 'Sulley Muntari|MID', 'Asamoah Gyan|FWD', 'Kwadwo Asamoah|FWD',
      'Prince Tagoe|FWD', 'Daniel Agyei|GK', 'Lee Addy|DEF', 'Jonathan Mensah|DEF', 'Dominic Adiyiah|FWD',
      'Stephen Appiah|MID', 'Derek Boateng|MID', 'Asamoah Gyan|MID', 'Kwadwo Asamoah|MID', 'Prince Tagoe|MID',
      'Kevin-Prince Boateng|FWD', 'Sulley Muntari|FWD', 'Anthony Annan|FWD'
    )),
  ]),

  PAN: wc(0, 'group', [
    tour(2018, 'Russia', 'group', 'Group Stage', s(
      'Jaime Penedo|GK', 'Michael Murillo|DEF', 'Fidel Escobar|DEF', 'Harold Cummings|DEF', 'Román Torres|DEF',
      'Gabriel Gómez|MID', 'Aníbal Godoy|MID', 'José Luis Rodríguez|MID', 'Blas Pérez|FWD', 'Luis Tejada|FWD',
      'Gabriel Torres|FWD', 'José Calderón|GK', 'Adolfo Machado|DEF', 'Luis Ovalle|DEF', 'Armando Cooper|MID',
      'Valentín Pimentel|MID', 'Abdiel Arroyo|FWD', 'Ismael Díaz|FWD', 'Blas Pérez|MID', 'Luis Tejada|MID',
      'Gabriel Torres|MID', 'Aníbal Godoy|FWD', 'Gabriel Gómez|FWD'
    )),
  ]),

  NOR: wc(0, 'roundOf16', [
    tour(1998, 'France', 'roundOf16', 'Round of 16', s(
      'Thomas Myhre|GK', 'Henning Berg|DEF', 'Stig Inge Bjørnebye|DEF', 'Ronny Johnsen|DEF', 'Dan Eggen|DEF',
      'Erik Mykland|MID', 'Ståle Solbakken|MID', 'Kjetil Rekdal|MID', 'Tore André Flo|FWD', 'Ole Gunnar Solskjær|FWD',
      'John Carew|FWD', 'Bjarne Goldbæk|MID', 'Roar Strand|MID', 'Gunnar Halle|DEF', 'Lars Bohinen|MID',
      'Tore André Flo|MID', 'Ole Gunnar Solskjær|MID', 'John Carew|MID', 'Erik Mykland|FWD', 'Ståle Solbakken|FWD',
      'Kjetil Rekdal|FWD', 'Henning Berg|MID', 'Ronny Johnsen|MID'
    )),
  ]),
};

module.exports = { history };
