insert into public.motos (slug,shortcode,marca,modelo,ano,km,valor,cidade,contato,obs,fonte_url,publicado_em,fotos,status)
select v.slug,v.sc,v.marca,v.modelo,v.ano,v.km,v.valor,v.cidade,v.contato,v.obs,v.fonte,v.pub::timestamptz,
 coalesce((select jsonb_agg('img/motos/'||v.slug||'/'||g||'.webp' order by g) from generate_series(1,v.n) g),'[]'::jsonb), v.status
from (values
('honda-cbx-750-f-1988-deurcupltd6','DeurcuplTD6','Honda','CBX 750 F','1988',null,75000,'Limeira-SP','(19) 9 8128-1806',null,'https://www.instagram.com/p/DeurcuplTD6/','2026-10-20T20:21:15.000Z',8,'ativo'),
('honda-cg-160-titan-2026-deun7ghn6ec','Deun7ghn6EC','Honda','CG 160 Titan','2026','26',29990,'Sorocaba-SP','(19) 9 8128-1806','Honda CG 160 comemorativa dos 50 anos Honda.
Moto com 26 km de fábrica.
Acompanha Side Car de alta qualidade com banco cadastrado no documento.','https://www.instagram.com/p/Deun7ghn6EC/','2026-10-20T19:50:30.000Z',8,'ativo'),
('suzuki-dr-650-rse-1996-deuzazsfss7','DeuZAZsFSS7','Suzuki','DR 650 RSE','1996','97.000',25000,'Barueri-SP','(19) 9 8128-1806',null,'https://www.instagram.com/p/DeuZAZsFSS7/','2026-10-20T17:40:05.000Z',8,'ativo'),
('honda-xr-250-tornado-2008-deuvac2lzd3','DeuVAC2lZD3','Honda','XR 250 Tornado','2008','90.000',25000,'Fortaleza-CE','(19) 9 8128-1806','Customizada como XR650L, restaurada com todos os parafusose eixos.
Pneus Metzeler Enduro 3, amortecedor traseiro Scud, corrente DID com retentor, guia de corrente e protetor de carcaça Deca, pedaleiras inox Sundown, carburador Keihin PWK30 (acompanha o original) escapamento completo BRC, bateria de lítio.','https://www.instagram.com/p/DeuVAC2lZD3/','2026-10-20T17:05:05.000Z',8,'ativo'),
('honda-cb-500-1998-deudxislv3k','DeuDXIslV3K','Honda','CB 500','1998','24.700',33000,'Londrina-PR','(19) 9 8128-1806','Moto com extrema conservação, integra e em perfeitas condições
Escapamento Coyote RS
Setas não são de fábrica, restante tudo Honda
Km de fábrica','https://www.instagram.com/p/DeuDXIslV3K/','2026-10-20T14:30:57.000Z',8,'ativo'),
('yamaha-dt-200-r-1995-det-xggfs-w','Det-XgGFS-W','Yamaha','DT 200 R','1995','93.000',43000,'São Paulo-SP','(19) 9 98128-1806','Moto Restaurada do zero nos mínimos detalhes, seguindo todos os padrões Yamaha
Restauro feita na Gotinha Racing
Motor standard
Escapamento Dogster todo de inox','https://www.instagram.com/p/Det-XgGFS-W/','2026-10-20T13:47:19.000Z',8,'ativo'),
('yamaha-dt-200-r-1999-det-mxvla2r','Det-MxVla2R','Yamaha','DT 200 R','1999','10.000',39000,'Campo Limpo Paulista-SP','(19) 9 8128-1806','Moto com muitas peças de fábrica Yamaha
Todos os plásticos são de fábrica
Manopla de fábrica
Espelhos toyo
Farol de fábrica
Lanterna de fábrica','https://www.instagram.com/p/Det-MxVla2R/','2026-10-20T13:45:51.000Z',8,'ativo'),
('yamaha-mini-enduro-50-1971-det-a-xlzuo','Det-A_xlZuo','Yamaha','Mini Enduro 50','1971','12.000',29000,'Campo Limpo Paulista-SP','(19) 9 8128-1806','Moto com muitas peças de fábrica Yamaha
Manoplas de fábrica
Pneu de fábrica
Pintura de fábrica
Lanterna, setas e farol de fábrica
Moto inteira de fábrica
Banco foi trocado a capa
Precisar fazer a ativação da moto, mas ela parou andando','https://www.instagram.com/p/Det-A_xlZuo/','2026-10-20T13:44:15.000Z',8,'ativo'),
('honda-magna-750-1996-det67fauv3g','Det67FauV3g','Honda','Magna 750','1996',null,47000,'Limeira-SP','(19) 9 8128-1806','Manual do proprietário.
Chave reserva.
Placa preta.
Documentação antigas.','https://www.instagram.com/p/Det67FauV3g/','2026-10-20T13:19:18.000Z',1,'ativo'),
('yamaha-xtz-250-x-2008-desa77ldvc7','Desa77lDVC7','Yamaha','XTZ 250 X','2008','4.800',29990,'São Paulo-SP','(19) 9 8128-1806','Moto com extrema conservação
- Óleo Motul 3000 20W50
- Filtro de óleo Yamaha
- Fluidos de freio Motul
- Bomba de combustível original Yamaha
- Filtro de ar Yamaha
- Veja de ignição Yamaha
- ⁠Manual, chave reserva e placa cinza vai junto
- ⁠Pneus de fábrica datada 2008
- ⁠Histórico de manutenções','https://www.instagram.com/p/Desa77lDVC7/','2026-10-19T23:18:29.000Z',8,'ativo'),
('honda-cb-400-1983-der-ilxh5sf','Der_IlXH5SF','Honda','CB 400','1983','39.552',29900,'Limeira-SP','(19) 9 8128-1806','Placa preta.
Pintura de chassis, ainda de fábrica.','https://www.instagram.com/p/Der_IlXH5SF/','2026-10-19T19:15:32.000Z',8,'ativo'),
('suzuki-a-100-1973-der-6u1n7e8','Der-6u1n7e8','Suzuki','A 100','1973','18.111',25000,'Limeira-SP','(19) 9 8128-1806','Manual do proprietário.
Restaurada.
Documento em dia.','https://www.instagram.com/p/Der-6u1n7e8/','2026-10-19T19:13:39.000Z',8,'ativo'),
('honda-cbx-750-four-1987-1988-derhvsvfd-w','DerhvSvFd-W','Honda','CBX 750 Four','1987/1988','49.857',80000,'Toledo-PR','(19) 9 8128-1806','Pintura já restaurada.
Bateria e pneus novos.
Porta documentos.','https://www.instagram.com/p/DerhvSvFd-W/','2026-10-19T14:58:41.000Z',8,'ativo'),
('suzuki-dr-800-s-1996-derdir1sozk','DerDiR1sOZK','Suzuki','DR 800 S','1996','47.663',29500,'Limeira-SP','(19) 9 8128-1806','Nunca restaurada.
Pneus michellin 70%, multimídia com Apple/android car play,  toda revisada, óleo trocado, rolamentos e caixa de direção novos, única manutenção a ser feita é arrumar o sem fim da roda para voltar o velocímetro.','https://www.instagram.com/p/DerDiR1sOZK/','2026-10-19T10:37:02.000Z',1,'ativo'),
('suzuki-gt-550-1975-deq6fsfls0s','Deq6FsFlS0s','Suzuki','GT 550','1975','52.600',79900,'São Paulo-SP','(19) 9 8128-1806','Modelo único na cor preta, de todas as GT somente a 550 e no ano de 75 saiu nesta cor, motor novo feito a 3.500 quilômetros, motocicleta impecável, tudo funciona perfeitamente inclusive o contador da posição de marchas no painel e a partida elétrica, até os parafusos são fábrica com a marcação da Suzuki, excelente restauração!!!','https://www.instagram.com/p/Deq6FsFlS0s/','2026-10-19T09:12:13.000Z',8,'ativo'),
('ducati-monster-821-2015-deojsj9hkt1','Deojsj9hkT1','Ducati','Monster 821','2015','10.401',34990,'Limeira-SP','(19) 9 8128-1806',null,'https://www.instagram.com/p/Deojsj9hkT1/','2026-10-18T11:19:55.000Z',1,'ativo'),
('yamaha-v-max-1200-cc-1995-deogjpflb9t','DeogJPflb9t','Yamaha','V-Max 1200 cc','1995','73.000',45000,'São Paulo-SP','(19) 9 8128-1806','Chassis Remarcado, por erro de registro de fábrica (comum em Yamaha V Max e Ténéré 600)','https://www.instagram.com/p/DeogJPflb9t/','2026-10-18T10:47:01.000Z',8,'ativo'),
('ktm-sx-e-5-2022-demy8xvfdlq','DemY8XVFdLQ','KTM','SX-E 5','2022',null,30000,'Belo Horizonte-MG','(19) 9 8128-1806',null,'https://www.instagram.com/p/DemY8XVFdLQ/','2026-10-17T15:05:37.000Z',4,'ativo'),
('can-am-ds-90-2019-demy2n-fyxl','DemY2N_FYxL','Can-Am','DS 90','2019',null,16500,'Belo Horizonte-MG','(19) 9 8128-1806',null,'https://www.instagram.com/p/DemY2N_FYxL/','2026-10-17T15:04:47.000Z',6,'ativo'),
('honda-cb-1300-four-2008-demvv56pgrr','DemVV56PGRr','Honda','CB 1300 Four','2008','78.037',54000,'Limeira-SP','(19) 9 8128-1806','Moto com extrema conservação.
- Revisões todas na concessionária Honda Aversa ( notas anexo)
- ⁠10 anos com o proprietário
- ⁠Abastecida somente com gasolina podium
- ⁠Filtro de ar K&N
- ⁠Oleo motor Motul 7100 sintético
- ⁠Filtro de óleo de fábrica Honda
- ⁠Transmissão nova marca DID
- ⁠Pastilhas dianteiras e traseiras novas de fábrica Honda
- ⁠Amortecedor de direção Hypro
- ⁠Pneus Metzeler novos
- ⁠Bateria nova marca Moura (um mês de uso)','https://www.instagram.com/p/DemVV56PGRr/','2026-10-17T14:35:38.000Z',1,'ativo'),
('honda-cb-750-four-1974-dekvs9zn7el','DekVS9Zn7eL','Honda','CB 750 Four','1974','5.400',159900,'Barueri-SP','(19) 9 8128-1806','Moto com extrema conservação
Restaurada nos mínimos detalhes em 2006, acompanhando os padrões Honda ( restauro tudo com peças Importadas do Japão, datado e fotografado )
Toda funcional e completa
Escapamento de fábrica Honda HM 341
Km após restauro.','https://www.instagram.com/p/DekVS9Zn7eL/','2026-10-16T19:55:16.000Z',8,'ativo'),
('suzuki-drz-400-2009-deku9nehxxp','DekU9NeHxXP','Suzuki','DRZ 400','2009','55.000',29990,'São Paulo-SP','(19) 9 8128-1806','DRZ em perfeito estado de conservação, com painel digital com velocimetro e temperatura e acompanha de fábrica
Tem escape de fábrica DRZ; Hodometro de fábrica
Revisão toda executada;','https://www.instagram.com/p/DekU9NeHxXP/','2026-10-16T19:52:18.000Z',6,'ativo'),
('harley-davidson-v-rod-2005-2006-dekohznlv5y','DekOhZNlV5y','Harley Davidson','V-Rod','2005/2006','43.000',45000,'João Pessoa-PB','(19) 9 8128-1806','Moto conservada e íntegra
Todas as manutenções feitas em especializada.','https://www.instagram.com/p/DekOhZNlV5y/','2026-10-16T18:56:04.000Z',8,'ativo'),
('yamaha-v-max-1200-1994-dekoljylrew','DekOLjYlRew','Yamaha','V-Max 1200','1994',null,78000,'Belo Horizonte-MG','(19) 9 8128-1806','Raridade em conservação
Completamente de fábrica
Pintura de fábrica
Adesivos de fábrica
Pneus novos Dunlop com menos de 100 milhas colocados em junho de 2026
Forração do banco de fábrica
Punhos de fábrica
Descargas de fábrica
Lentes de seta dianteiras e traseiras, lente do farol e lanterna traseira de fábrica
Motocicleta impecável e completamente de fábrica
Todos acabamentos de fábrica e em excelente estado de conservação.','https://www.instagram.com/p/DekOLjYlRew/','2026-10-16T18:53:05.000Z',8,'ativo'),
('dafra-kansas-250-special-2009-dekalzelxkf','DekALZelXkf','Dafra','Kansas 250 Special','2009','6.5000',16500,'Ouro Preto-MG','(19) 9 8128-1806','2 pneus Deluxe Technic (dianteiro 21, traseiro 15)
Paralama traseiro Ducktail
Par de amortecedores Tunning Far Rafaela 27cm novo
Guidão buckhorn e paralama dianteiro LSL garage custom
Par de alongador de bengala 12cm
Roda dianteira raiada 21
Banco King and Queen fabricação própria (acompanha de fábrica)
Sissy Bar cromado 45cm
kit relação nova
Bateria de fábrica comprada em janeiro 2026
Estator novo
Retificador de voltagem novo
tampas do motor lado esquerdo novas cromadas
Velocímetro lateral (odômetro com defeito)
kit Mini piscas bullet cromado
Caixa de direção e fluído de freio novos
Velas novas
Válvulas recém reguladas
Carburador limpo em julho
Engrenagens da bomba de óleo trocadas com 50mil kml
Limpeza do filtro do cárter com 50mil km
Opcionais: manta mexicana, sider bag (com avaria interna)
Coletor de ar e coletor de admissão novos (falta instalar)
Acompanha uma série de peças de fábrica de reposição e de customização, incluindo um guidão ape hanger 12’ LSL Garage custom cromado novo que não cheguei a instalar.
Moto há 10 anos com o mesmo proprietário','https://www.instagram.com/p/DekALZelXkf/','2026-10-16T16:50:44.000Z',8,'ativo'),
('yamaha-pw-50-1980-dejvb9xfv8d','Dejvb9xFV8d','Yamaha','PW 50','1980',null,12000,'Limeira-SP','(19) 9 8128-1806','Moto precisa trocar os adesivos,para lama dianteiro e o punho on/start/off (todas as peças vendidas na internet)','https://www.instagram.com/p/Dejvb9xFV8d/','2026-10-16T14:24:27.000Z',8,'ativo'),
('yamaha-pw-80-2005-deju6q2lc2f','Deju6Q2lc2f','Yamaha','PW 80','2005',null,12000,'Limeira-SP','(19) 9 8128-1806','Moto precisa de pintura de tanque e adesivos novos.','https://www.instagram.com/p/Deju6Q2lc2f/','2026-10-16T14:19:51.000Z',8,'ativo'),
('suzuki-ds-80-1995-dejodvsfdtd','DejoDVsFdTd','Suzuki','DS 80','1995',null,19900,'Limeira-SP','(19) 9 8128-1806',null,'https://www.instagram.com/p/DejoDVsFdTd/','2026-10-16T13:19:55.000Z',8,'ativo'),
('honda-cb-450-tr-1987-deibysev9yt','DeiBYsEv9YT','Honda','CB 450 TR','1987','87.358',23000,'Limeira-SP','(19) 9 8128-1806','moto integra e 100% em dia.','https://www.instagram.com/p/DeiBYsEv9YT/','2026-10-15T22:25:01.000Z',1,'ativo'),
('harley-davidson-xl-883-n-2015-dehwy-mjemc','Dehwy_mJEMc','Harley Davidson','XL 883 N','2015','9.200',47000,'Limeira-SP','(19) 9 8128-1806',null,'https://www.instagram.com/p/Dehwy_mJEMc/','2026-10-15T20:00:01.000Z',1,'ativo'),
('gas-gas-enducross-250-2001-deho8ualv-g','Deho8UAlV_g','Gas Gas','Enducross 250','2001',null,57900,'Taubaté-SP','(19) 9 8128-1806','Gas Gas Emplacada
Com extrema conservação
Escapamento FMF
Curva Dogster
Aros Excel Tagaso
Pneu Metzeler
Disco Próx
Suspensão traseira ohlins
Guidão KTM
Filtro de ar Twinair
Aeroquip flexível dianteiro e traseiro
V-Force 3 completo
Painel digital','https://www.instagram.com/p/Deho8UAlV_g/','2026-10-15T18:49:13.000Z',8,'ativo'),
('ducati-multistrada-v4s-2022-2023-dehudruukpm','DehUDruuKpM','Ducati','Multistrada V4S','2022/2023','⁠⁠22.299',92500,'Limeira-SP','(19) 9 8128-1806','Todas as revisões feitas na Ducati.
Acessórios:
- ⁠Protetor de motor Carena.
- ⁠Suporte e carplay.
- ⁠Baús laterais Ducati.
- ⁠Bolsas internas nos 2 baús.
- ⁠Farol de milha.
- ⁠2 Pneus zero.
* Kit banco baixo.
* Carga celular por indução.
* Protetor radiador.
* Kit suspensão rebaixada.
* Link pipe.','https://www.instagram.com/p/DehUDruuKpM/','2026-10-15T15:48:24.000Z',1,'ativo'),
('kawasaki-en-500-vulcan-1997-deg7yyxbfja','Deg7YyxBfJA','Kawasaki','EN 500 Vulcan','1997',null,25000,'Limeira-SP','(19) 9 8128-1806','Moto de coleção.','https://www.instagram.com/p/Deg7YyxBfJA/','2026-10-15T12:12:44.000Z',1,'ativo'),
('lambretta-li-150-1962-defilf8nsxk','DefiLF8NSxk','Lambretta','LI 150','1962',null,24000,'Limeira-SP','(19) 9 8128-1806','Funcionando perfeitamente.
Documentada 2026.','https://www.instagram.com/p/DefiLF8NSxk/','2026-10-14T23:14:31.000Z',1,'ativo'),
('honda-ml-125-1987-1988-defo1eeh7uj','DefO1eEH7uJ','Honda','ML 125','1987 / 1988','14.696',29900,'Goiania-GO','(19) 9 8128-1806',null,'https://www.instagram.com/p/DefO1eEH7uJ/','2026-10-14T20:22:37.000Z',8,'ativo'),
('triumph-thruxton-1200-r-2016-defii8cn2ki','DefIi8Cn2Ki','Triumph','Thruxton 1200 R','2016','19.700',42900,'Cachoeirinha-RS','(19) 9 8128-1806','Moto com extrema conservação
20.000 quilômetros de fábrica
ABS Brembo, com 3 modos de pilotagem
Suspensão ajustável
Pneus e bateria novos
Moto de garagem, só usada nos finais de semana
Sem detalhes, para pessoas exigentes.','https://www.instagram.com/p/DefIi8Cn2Ki/','2026-10-14T19:27:39.000Z',8,'ativo'),
('honda-cb-400-1981-dee7-5sffpq','Dee7_5SFfPQ','Honda','CB 400','1981','15',24500,'Jundiaí-SP','(19) 9 8128-1806','Raridade em Café Racer, feita nos mínimos detalhes.
Mecanica e elétrica novo.
Carburador importado novo.
Várias peças e acessórios importados.
Km após restauro.','https://www.instagram.com/p/Dee7_5SFfPQ/','2026-10-14T17:38:00.000Z',8,'ativo')
) as v(slug,sc,marca,modelo,ano,km,valor,cidade,contato,obs,fonte,pub,n,status)
on conflict (slug) do nothing;
update public.motos set capa='img/motos/'||slug||'/capa.webp';
update public.motos set obs = regexp_replace(obs, E'[\\u2060]', '', 'g'), km = regexp_replace(km, E'[\\u2060]', '', 'g');
update public.motos set km = '65.000' where shortcode = 'DekALZelXkf' and km = '6.5000';
