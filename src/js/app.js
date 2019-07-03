import loadJson from '../components/load-json/'
import { Voronoi } from './modules/voronoi'

const app = {

	init: () => {

		// https://interactive.guim.co.uk/gis/voronoi.json

		Promise.all([loadJson("https://interactive.guim.co.uk/docsdata/19sWVbvRSAE9Xxs9FnKRTTzUMSEJ28s45wgSdAzizvb0.json"),
				loadJson("<%= path %>/assets/voronoi.json")])
			.then((allData) => {
				new Voronoi(allData[0].sheets, allData[1])
			},
			function error(e) {
				throw e;
			}
		)
  	}
}

app.init()
