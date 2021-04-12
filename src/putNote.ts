export const handler = async () => {
  console.log('Hello World :)');

  return {
    statusCode: 200,
    body: JSON.stringify({ hello: 'world' }),
  }
}
