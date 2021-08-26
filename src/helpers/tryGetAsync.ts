export default async function tryGetAsync<T>(getter: () => Promise<T>): Promise<
  | {
      success: true;
      value: T;
    }
  | {
      success: false;
      error: Error;
    }
> {
  try {
    return {
      success: true,
      value: await getter(),
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
    };
  }
}
