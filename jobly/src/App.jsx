// src/App.jsx
// Jobly : page simple affichant plusieurs offres d'emploi avec Tailwind CSS

export default function App() {
  const jobs = [
    { id: 1, title: "Développeur Frontend React", description: "Travail sur des interfaces modernes avec React.", company: "Pixel Labs" },
    { id: 2, title: "Ingénieur Données Junior", description: "Collecte et nettoyage des données pour l'équipe produit.", company: "DataWave" },
    { id: 3, title: "Product Manager", description: "Coordination des équipes et suivi de la feuille de route produit.", company: "StartupFlow" },
    { id: 4, title: "Designer UI/UX", description: "Concevoir des interfaces claires et accessibles.", company: "CreativeCore" },
    { id: 5, title: "DevOps / Cloud", description: "Automatisation des déploiements et gestion du cloud.", company: "Opsify" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Jobly</h1>
        <p className="text-gray-700">Découvrez nos offres d'emploi</p>
      </header>

      <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-4">{job.description}</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Learn more</button>
          </div>
        ))}
      </main>
    </div>
  );
}