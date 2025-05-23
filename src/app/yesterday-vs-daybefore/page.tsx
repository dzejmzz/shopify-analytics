import YesterdayVsDayBeforeTable from '../../components/YesterdayVsDayBeforeTable';
import NavBar from '../../components/NavBar';

export default function YesterdayVsDayBeforePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <NavBar />
      <div className="max-w-screen-lg mx-auto">
        <div className="pl-8 md:pl-8">
          <h1 className="text-3xl font-bold mb-6 text-black">Yesterday vs Day Before</h1>
        </div>
        <YesterdayVsDayBeforeTable />
      </div>
    </main>
  );
} 