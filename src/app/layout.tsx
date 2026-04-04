import { Outlet } from 'react-router-dom';

export const Layout = (): React.JSX.Element => {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
};
