import loadJson from '../components/load-json/'
import { Voronoi } from './modules/voronoi'

const app = {

	init: () => {

		loadJson('https://interactive.guim.co.uk/docsdata/19sWVbvRSAE9Xxs9FnKRTTzUMSEJ28s45wgSdAzizvb0.json?t=' + new Date().getTime())
			.then((resp) => {
				app.gis(resp.sheets)
			})

	},

	gis: (data) => {

		loadJson('https://interactive.guim.co.uk/gis/voronoi.json?t=' + new Date().getTime())
			.then((resp) => {
				new Voronoi(data, resp, "PPId")
			})
	}

}

app.init()
