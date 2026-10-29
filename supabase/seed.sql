-- DEMO DATA for UI development (prompt P6). Fictional, no real organisations or people.
-- Remove before going public:  delete from public.stories where slug like 'demo-%';
insert into public.sources (slug, name, domain, language, country, authority)
values ('demo', 'Exemple Info', 'example.org', 'fr', 'FR', 3), ('demo-en', 'Sample Wire', 'example.com', 'en', 'GB', 4)
on conflict (slug) do nothing;

insert into public.stories
 (slug, headline, summary, explainer, category, importance, llm_importance, hot_score, event_at, first_seen_at, last_source_at, source_count, locations, countries, languages, status, needs_resummary, summarized_at, model, prompt_version)
values
 ('demo-1','Un sommet régional s’ouvre sous haute tension','Dix-huit pays se réunissent pour négocier un accord sur l’eau partagée. Les discussions doivent durer trois jours et le quorum est déjà atteint.','Les fleuves transfrontaliers sont au cœur de tensions anciennes entre les États riverains.','monde',91,88,84,now()-interval '25 minutes',now()-interval '40 minutes',now()-interval '12 minutes',5,'[{"name":"Lisbonne","country":"PT"}]','{PT}','{fr,en}','published',false,now(),'demo','v1'),
 ('demo-2','La banque centrale relève ses taux de 0,25 point','Le taux directeur passe à 3,5 %. Les marchés attendaient cette hausse, qui vise à freiner l’inflation.',null,'economie',74,70,66,now()-interval '3 hours',now()-interval '3 hours',now()-interval '2 hours',4,'[{"name":"Francfort","country":"DE"}]','{DE}','{en}','published',false,now(),'demo','v1'),
 ('demo-3','Une exoplanète tempérée repérée à 40 années-lumière','Des astronomes ont détecté une exoplanète de la taille de la Terre dans la zone habitable de son étoile. Des observations complémentaires sont prévues.',null,'science',58,60,50,now()-interval '6 hours',now()-interval '6 hours',now()-interval '5 hours',3,'[]','{}','{en}','published',false,now(),'demo','v1'),
 ('demo-4','Un rançongiciel paralyse les services d’un hôpital','Les systèmes informatiques d’un hôpital sont à l’arrêt depuis la nuit. Les urgences fonctionnent en mode dégradé.',null,'tech',52,55,44,now()-interval '9 hours',now()-interval '9 hours',now()-interval '8 hours',2,'[{"name":"Lyon","country":"FR"}]','{FR}','{fr}','published',false,now(),'demo','v1'),
 ('demo-5','La saison des pluies démarre avec un mois d’avance','Le phénomène El Niño décale le début des pluies sur la côte. Les agriculteurs adaptent leurs semis.',null,'climat',34,35,25,now()-interval '1 day',now()-interval '1 day',now()-interval '23 hours',1,'[{"name":"Lima","country":"PE"}]','{PE}','{en}','published',false,now(),'demo','v1'),
 ('demo-6','Un festival de cinéma dévoile sa sélection','Vingt films sont en compétition, dont six premiers longs-métrages. L’ouverture est prévue samedi.',null,'culture',18,20,11,now()-interval '2 days',now()-interval '2 days',now()-interval '47 hours',1,'[{"name":"Locarno","country":"CH"}]','{CH}','{fr}','published',false,now(),'demo','v1')
on conflict (slug) do nothing;

insert into public.story_sources (story_id, source_id, url, title, published_at)
select s.id, so.id, 'https://example.org/' || s.slug || '-a', 'Titre original de la source A', s.last_source_at
from public.stories s cross join public.sources so where s.slug like 'demo-%' and so.slug = 'demo'
on conflict do nothing;
insert into public.story_sources (story_id, source_id, url, title, published_at)
select s.id, so.id, 'https://example.com/' || s.slug || '-b', 'Original headline from source B', s.first_seen_at
from public.stories s cross join public.sources so where s.slug like 'demo-%' and so.slug = 'demo-en' and s.source_count > 1
on conflict do nothing;

insert into public.glossary_terms (canonical, canonical_key, definition) values
 ('quorum','quorum','Nombre minimal de participants nécessaire pour qu’une réunion puisse décider.'),
 ('taux directeur','taux directeur','Taux fixé par la banque centrale, qui sert de référence aux taux des banques.'),
 ('exoplanète','exoplanète','Planète qui tourne autour d’une autre étoile que le Soleil.'),
 ('rançongiciel','rançongiciel','Logiciel malveillant qui bloque des fichiers et exige de l’argent pour les rendre.'),
 ('El Niño','el niño','Réchauffement périodique de l’océan Pacifique qui perturbe le climat de nombreuses régions.')
on conflict (canonical_key) do nothing;

insert into public.story_terms (story_id, term_id, surface)
select s.id, g.id, g.canonical from (values
  ('demo-1','quorum'),('demo-2','taux directeur'),('demo-3','exoplanète'),('demo-4','rançongiciel'),('demo-5','El Niño')
) as m(slug, term) join public.stories s on s.slug = m.slug join public.glossary_terms g on g.canonical_key = lower(m.term)
on conflict do nothing;
