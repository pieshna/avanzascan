export async function POST({ cookies, redirect }) {
  cookies.delete('session', { path: '/' }); // Asegúrate de especificar el path correcto
  return redirect('/login');
}
