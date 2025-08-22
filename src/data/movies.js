const movies = [
  { title: 'The Shawshank Redemption', year: 1994, genres: ['Drama'],
    overview: 'Two imprisoned men bond over years, finding solace and redemption.', 
    poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg' },

  { title: 'The Dark Knight', year: 2008, genres: ['Action','Crime','Drama'],
    overview: 'Batman faces the Joker, a criminal mastermind who thrusts Gotham into anarchy.', 
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },

  { title: 'Interstellar', year: 2014, genres: ['Sci-Fi','Drama','Adventure'],
    overview: 'Explorers travel through a wormhole in space to ensure humanity’s survival.', 
    poster: 'https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg' },

  { title: 'The Martian', year: 2015, genres: ['Sci-Fi','Adventure','Drama'],
    overview: 'An astronaut stranded on Mars relies on ingenuity to survive.', 
    poster: 'https://image.tmdb.org/t/p/w500/5aGhaIHYuQbqlHWvWYqMCnj40y2.jpg' },

  { title: 'La La Land', year: 2016, genres: ['Romance','Drama','Music'],
    overview: 'A jazz musician and an aspiring actress fall in love pursuing their dreams.', 
    poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg' },

  { title: 'Parasite', year: 2019, genres: ['Thriller','Drama'],
    overview: 'Greed and class discrimination upend a symbiotic relationship.', 
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },

  { title: 'Inception', year: 2010, genres: ['Sci-Fi','Action','Thriller'],
    overview: 'A thief enters people’s dreams to steal secrets but faces an impossible mission.', 
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg' },

  { title: 'Forrest Gump', year: 1994, genres: ['Drama','Romance'],
    overview: 'Forrest Gump, a man with a kind heart, witnesses defining moments of history.', 
    poster: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg' },

  { title: 'Fight Club', year: 1999, genres: ['Drama','Thriller'],
    overview: 'An insomniac office worker forms an underground fight club with a soap maker.', 
    poster: 'https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg' },

  { title: 'The Godfather', year: 1972, genres: ['Crime','Drama'],
    overview: 'The aging patriarch of an organized crime dynasty transfers control to his son.', 
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },

  { title: 'Pulp Fiction', year: 1994, genres: ['Crime','Drama'],
    overview: 'The lives of two mob hitmen, a boxer, and more intertwine in tales of violence.', 
    poster: 'https://image.tmdb.org/t/p/w500/dM2w364MScsjFf8pfMbaWUcWrR.jpg' },

  { title: 'Spirited Away', year: 2001, genres: ['Animation','Fantasy','Adventure'],
    overview: 'A young girl enters a world of spirits and must find a way to return home.', 
    poster: 'https://image.tmdb.org/t/p/w500/oRvMaJOmapypFUcQqpgHMZA6qL9.jpg' },

  { title: 'Avengers: Endgame', year: 2019, genres: ['Action','Sci-Fi','Adventure'],
    overview: 'The Avengers assemble once more in a final attempt to undo Thanos’ actions.', 
    poster: 'https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg' },

  { title: 'Titanic', year: 1997, genres: ['Romance','Drama'],
    overview: 'A young couple from different social classes fall in love aboard the Titanic.', 
    poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg' },

  { title: 'Whiplash', year: 2014, genres: ['Drama','Music'],
    overview: 'A young drummer enrolls in a music conservatory where an abusive instructor pushes him to greatness.', 
    poster: 'https://image.tmdb.org/t/p/w500/oPxnRhyAIzJKGUEdSiwTJQBa4d.jpg' },

  { title: 'The Social Network', year: 2010, genres: ['Drama','Biography'],
    overview: 'The story of the founders of Facebook and their legal battles.', 
    poster: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg' },

  { title: 'Gladiator', year: 2000, genres: ['Action','Drama'],
    overview: 'A betrayed Roman general seeks revenge against the corrupt emperor who murdered his family.', 
    poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg' },

  { title: 'Coco', year: 2017, genres: ['Animation','Family','Music'],
    overview: 'Aspiring musician Miguel enters the Land of the Dead to uncover his family’s legacy.', 
    poster: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg' },

  { title: 'The Lion King', year: 1994, genres: ['Animation','Adventure','Drama'],
    overview: 'Lion prince Simba flees his kingdom after the death of his father, only to learn his true destiny.', 
    poster: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg' },

  { title: 'Dune: Part One', year: 2021, genres: ['Sci-Fi','Adventure','Drama'],
    overview: 'Paul Atreides leads nomadic tribes in a battle to control the desert planet Arrakis.', 
    poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' }
]

export default movies
