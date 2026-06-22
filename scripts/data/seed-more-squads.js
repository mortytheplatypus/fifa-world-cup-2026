const { cp } = require('./seed-helpers');

const moreCurrentSquads = {
  // ── BIH ──
  BIH: {
    coach: { name: 'Sergej Barbarez', nationality: 'Bosnia and Herzegovina' },
    captain: 'Edin Džeko',
    players: [
      cp('Ibrahim Šehić', 'GK', 1, 'Konyaspor', '1988-09-02', 188, 'right', 45, 0, 0, 0),
      cp('Asmir Begović', 'GK', 12, 'Leicester City', '1987-06-20', 198, 'right', 65, 0, 1, 0),
      cp('Kenan Stupčanin', 'GK', 22, 'Sarajevo', '2001-08-22', 190, 'right', 3, 0, 0, 0),
      cp('Sead Kolašinac', 'DEF', 4, 'Marseille', '1993-06-20', 183, 'left', 60, 0, 1, 0),
      cp('Adrian Leon Čatić', 'DEF', 5, 'Zrinjski Mostar', '1995-04-05', 185, 'right', 20, 1, 0, 0),
      cp('Dennis Stajić', 'DEF', 3, 'Velež Mostar', '1997-08-29', 188, 'right', 15, 0, 0, 0),
      cp('Stjepan Lončar', 'DEF', 2, 'Sarajevo', '1996-11-10', 180, 'right', 18, 0, 0, 0),
      cp('Tarik Muharemović', 'DEF', 15, 'Sion', '2001-03-18', 190, 'right', 8, 0, 0, 0),
      cp('Nermin Karić', 'DEF', 13, 'Sarajevo', '1998-03-12', 182, 'right', 10, 0, 0, 0),
      cp('Miralem Pjanić', 'MID', 10, 'Sharjah', '1990-04-02', 180, 'right', 115, 18, 1, 0),
      cp('Rade Krunić', 'MID', 7, 'Fenerbahçe', '1993-10-07', 184, 'right', 55, 5, 0, 0),
      cp('Benjamin Tahirović', 'MID', 8, 'Ajax', '2003-03-22', 191, 'right', 10, 1, 0, 0),
      cp('Amar Karić', 'MID', 6, 'Wolfsberger AC', '1997-06-22', 175, 'right', 12, 0, 0, 0),
      cp('Gojko Cimirot', 'MID', 14, 'Al-Rayyan', '1992-12-19', 178, 'right', 50, 1, 0, 0),
      cp('Edin Višća', 'MID', 11, 'Trabzonspor', '1990-01-17', 172, 'right', 60, 6, 0, 0),
      cp('Miroslav Stevanović', 'MID', 16, 'Servette', '1990-07-29', 180, 'right', 35, 4, 0, 0),
      cp('Edin Džeko', 'FWD', 9, 'Fiorentina', '1986-03-17', 193, 'right', 130, 68, 1, 1),
      cp('Luka Menalo', 'FWD', 18, 'Celje', '1998-07-22', 185, 'right', 15, 3, 0, 0),
      cp('Ermedin Demirović', 'FWD', 19, 'Stuttgart', '1998-03-25', 185, 'right', 25, 8, 0, 0),
      cp('Miroslav Marić', 'FWD', 20, 'Osijek', '1996-05-04', 188, 'right', 8, 2, 0, 0),
      cp('Said Rahimović', 'FWD', 21, 'Sarajevo', '1999-02-15', 180, 'right', 5, 1, 0, 0),
      cp('Anel Ahmedhodžić', 'DEF', 17, 'Sheffield United', '1999-03-26', 190, 'right', 25, 1, 0, 0),
      cp('Martin Šabanović', 'MID', 23, 'Sarajevo', '2000-01-08', 178, 'right', 4, 0, 0, 0),
    ],
  },

  // ── QAT ──
  QAT: {
    coach: { name: 'Marquez Lopes', nationality: 'Brazil' },
    captain: 'Hassan Al-Haydos',
    players: [
      cp('Saad Al-Sheeb', 'GK', 1, 'Al-Sadd', '1990-09-19', 188, 'right', 80, 0, 1, 0),
      cp('Mishal Barsham', 'GK', 22, 'Al-Sadd', '1992-02-14', 185, 'right', 30, 0, 0, 0),
      cp('Yousuf Hassan', 'GK', 12, 'Al-Arabi', '1996-05-24', 188, 'right', 8, 0, 0, 0),
      cp('Boualem Khoukhi', 'DEF', 4, 'Al-Sadd', '1990-07-09', 183, 'right', 100, 20, 1, 0),
      cp('Abdelkarim Hassan', 'DEF', 3, 'Al-Sadd', '1993-08-28', 186, 'left', 130, 15, 1, 0),
      cp('Pedro Miguel', 'DEF', 2, 'Al-Sadd', '1990-03-24', 183, 'right', 90, 2, 1, 0),
      cp('Tarek Salman', 'DEF', 5, 'Al-Sadd', '1997-12-05', 185, 'right', 40, 0, 1, 0),
      cp('Homam Ahmed', 'DEF', 14, 'Al-Gharafa', '2000-08-11', 178, 'left', 25, 1, 0, 0),
      cp('Yousuf Aymen', 'DEF', 15, 'Al-Wakrah', '2000-08-11', 185, 'right', 12, 0, 0, 0),
      cp('Assim Madibo', 'MID', 6, 'Al-Wakrah', '1996-10-22', 175, 'right', 50, 0, 1, 0),
      cp('Hassan Al-Haydos', 'MID', 10, 'Al-Sadd', '1990-09-11', 178, 'left', 130, 40, 1, 0),
      cp('Akram Afif', 'MID', 11, 'Al-Sadd', '1996-11-18', 175, 'right', 90, 25, 1, 0),
      cp('Karim Boudiaf', 'MID', 8, 'Al-Duhail', '1990-09-16', 183, 'right', 100, 5, 1, 0),
      cp('Mohammed Muntari', 'MID', 7, 'Al-Duhail', '1993-02-10', 175, 'right', 60, 8, 0, 0),
      cp('Ahmed Alaaeldin', 'MID', 16, 'Al-Gharafa', '1993-01-28', 175, 'right', 35, 3, 0, 0),
      cp('Ali Asad', 'MID', 17, 'Al-Sadd', '1993-08-19', 170, 'right', 45, 2, 0, 0),
      cp('Almoez Ali', 'FWD', 9, 'Al-Duhail', '1996-02-01', 180, 'right', 110, 50, 1, 0),
      cp('Mohammed Muntari', 'FWD', 19, 'Al-Duhail', '1993-02-10', 188, 'right', 40, 12, 0, 0),
      cp('Ghanim Saeed', 'FWD', 18, 'Al-Arabi', '2001-01-15', 180, 'right', 10, 2, 0, 0),
      cp('Youssef Aymen', 'FWD', 20, 'Al-Wakrah', '2000-08-11', 182, 'right', 8, 1, 0, 0),
      cp('Mostafa Meshaal', 'MID', 13, 'Al-Wakrah', '2001-01-28', 175, 'right', 15, 0, 0, 0),
      cp('Jasim Abdulaziz', 'MID', 21, 'Al-Sadd', '2002-03-15', 178, 'right', 6, 0, 0, 0),
      cp('Meshaal Barsham', 'DEF', 23, 'Al-Sadd', '1997-02-14', 183, 'right', 20, 0, 0, 0),
    ],
  },
};

module.exports = { moreCurrentSquads };
