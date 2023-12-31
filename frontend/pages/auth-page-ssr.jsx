import { withSession } from "../src/services/auth/session";

export default function AuthPageSSR(props) {

  return (
    <div>
      <h1>Auth Page Server Side Render</h1>
      
      <p><a href="/logout">Logout</a></p>
      
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}

// Aplicando o padrão de projeto Decorator no getServerSideProps

export const getServerSideProps = withSession(ctx => {
  return {
    props: {
      session: ctx.req.session
    }
  }
});


// o ctx (contexto) só existe no server side, no navegador ele sempre vai ser nulo
// export async function getServerSideProps(ctx) {
//   try {
//     const session = await authService.getSession(ctx);
//     return {
//       props: {
//         session,
//       },
//     }
//   }
//   catch(err) {
//     return {
//       redirect: {
//         permanent: false,
//         destination: '/?error=401'
//       }
//     }
//   }
// }

