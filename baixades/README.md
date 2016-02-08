# Baixades script

## MySQL table

CREATE TABLE `baixades` (
  `data` datetime NOT NULL,
  `idrebost` int(6) NOT NULL,
  `mirall` int(3) unsigned NOT NULL DEFAULT '0',
  `extern` int(1) unsigned NOT NULL DEFAULT '0',
  `so` int(2) unsigned NOT NULL DEFAULT '0',
  `versio` varchar(20) NOT NULL,
  `locale` varchar(16) DEFAULT NULL,
  `os` int(2) unsigned DEFAULT '0',
  `os_version` varchar(20) DEFAULT NULL,
  `type` int(1) unsigned DEFAULT '0',
  `browser` int(2) unsigned DEFAULT '0',
  `browser_version` varchar(20) DEFAULT NULL,
  `moz_name` varchar(20) DEFAULT NULL,
  `moz_name_version` varchar(15) DEFAULT NULL,
  KEY `dataIDX` (`data`),
  KEY `idrebostIDX` (`idrebost`),
  KEY `mirallIDX` (`mirall`),
  KEY `externIDX` (`extern`),
  KEY `soIDX` (`so`),
  KEY `versioIDX` (`versio`),
  KEY `localeIDX` (`locale`),
  KEY `osIDX` (`os`),
  KEY `os_versionIDX` (`os_version`),
  KEY `typeIDX` (`type`),
  KEY `browserIDX` (`browser`),
  KEY `browser_versionIDX` (`browser_version`),
  KEY `moz_nameIDX` (`moz_name`),
  KEY `moz_name_versionIDX` (`moz_name_version`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8


