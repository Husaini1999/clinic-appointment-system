import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
	return (
		<div>
			<Header />
			<main>
				{' '}
				{/* Adjust margin based on your header height */}
				{children}
			</main>
		</div>
	);
};

export default Layout;
