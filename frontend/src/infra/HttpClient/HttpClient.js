// Arquitetura Hexagonal
// Ports & Adapters

import { tokenService } from "../../services/auth/tokenService";
import nookies from 'nookies';

// adaptamos o fetch para o nosso caso de uso, personalizamos e padronizamos ele para nossas necessidades
export async function HttpClient(fetchUrl, fetchOptions = {}) {
  const defaultHeaders = fetchOptions?.headers ?? {};
 
  const options = {
    ...fetchOptions,
    headers: { 
      'Content-Type': 'application/json',
      ...defaultHeaders,
    },
    body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : null,
  };
  
  return fetch(fetchUrl, options)
    .then(async (response) => {
      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: await response.json(),
      }
    })
    .then(async (response) => {
      if(!fetchOptions.refresh) return response;
      if(response.status !== 401) return response;
      
      const isServer = Boolean(fetchOptions?.ctx);
      const currentRefreshToken = fetchOptions?.ctx?.req?.cookies['REFRESH_TOKEN_NAME'];

      const refreshResponse = await HttpClient('http://localhost:3000/api/refresh', {
        method: isServer ? 'PUT' : 'GET',
        body: isServer ? { refresh_token: currentRefreshToken } : undefined,
      });

      const newAccessToken = refreshResponse.body.data.access_token;
      const newRefreshRoken = refreshResponse.body.data.refresh_token;
      
      if(isServer) {
        nookies.set(fetchOptions.ctx, 'REFRESH_TOKEN_NAME', newRefreshRoken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/'
        })
      }

      tokenService.save(newAccessToken);

      const retryResponse = await HttpClient(fetchUrl, {
        ...options,
        refresh: false,
        headers: {
          'Authorization': `Bearer ${newAccessToken}`
        }
      })
      
      return retryResponse;
    });
}
