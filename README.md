# GreenCubes Tickets

Ticket system for [GreenCubes](http://greencubes.org).

## Troubleshooting
#### ```"Error: ER_DUP_FIELDNAME: Duplicate column name '_waterline_dummy02492'"```
Run this sql code in your application MySQL DB for fixing.
```SQL
ALTER TABLE `admreq` DROP `_waterline_dummy02492`;
ALTER TABLE `ban` DROP `_waterline_dummy02492`;
ALTER TABLE `banlist` DROP `_waterline_dummy02492`;
ALTER TABLE `bugreport` DROP `_waterline_dummy02492`;
ALTER TABLE `regen` DROP `_waterline_dummy02492`;
ALTER TABLE `rempro` DROP `_waterline_dummy02492`;
ALTER TABLE `rights` DROP `_waterline_dummy02492`;
ALTER TABLE `ticket` DROP `_waterline_dummy02492`;
ALTER TABLE `unban` DROP `_waterline_dummy02492`;
```

## Authors
**Idea and consultation** by *Rena4ka aka Anna Dorogova*.

**First UI mockups and consultation** by *Feyola aka Elina Jernova*.

**GreenCubes logotype** by *MushroomKiller aka Sergey Tsvetkov*.

**Realisation** by *Kern0 aka Arseniy Maximov*.
