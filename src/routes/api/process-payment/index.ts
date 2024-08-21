import type { RequestHandler } from '@builder.io/qwik-city';
import Stripe from 'stripe';
import type { CartProduct } from '~/utils/store';

let stripe: Stripe;

export const onPost: RequestHandler = async ({ request, json, env }) => {
	const body = await request.json();
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!stripe) {
		stripe = new Stripe(env.get('STRIPE_SECRET_KEY') || '');
	}
	const stripeLineItems = body.products.map((product: CartProduct) => ({
		price_data: {
			currency: 'usd',
			product_data: {
				name: product.name,
				images: [`${import.meta.env.VITE_APP_URL}/images/${product.image}`],
			},
			unit_amount: parseFloat(product.price.toString()) * 100,
		},
		quantity: product.quantity,
	}));
	const session = await stripe.checkout.sessions.create({
		line_items: stripeLineItems,
		mode: 'payment',
		success_url: `${import.meta.env.VITE_APP_URL}/success`,
		cancel_url: `${import.meta.env.VITE_APP_URL}/cancel`,
		shipping_address_collection: { allowed_countries: ['US'] },
		shipping_options: [
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: { amount: 0, currency: 'usd' },
					display_name: 'Standard Shipping',
					delivery_estimate: {
						minimum: { unit: 'day', value: 3 },
						maximum: { unit: 'day', value: 5 },
					},
				},
			},
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: { amount: 1500, currency: 'usd' },
					display_name: 'Express shipping',
					delivery_estimate: {
						minimum: { unit: 'day', value: 1 },
						maximum: { unit: 'day', value: 3 },
					},
				},
			},
		],
	});
	json(200, { session });
};
