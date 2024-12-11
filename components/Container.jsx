'use client'
import React, { useState, useEffect } from 'react'
import { csv } from 'd3'
import Mapcontainer from './Mapcontainer'
import Chartcontainer from './Chartcontainer'
import Multichart from './Multichart'
import {
  Flex,
  Box,
  Tabs,
  TabList,
  Tab,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure
} from '@chakra-ui/react'

const Container = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showChart, setShowChart] = useState('single')
  const [mainAirport, setMainAirport] = useState('New York, NY: John F. Kennedy International')
  const [airportData, setAirportData] = useState(null)
  const [airlinesData, setAirlinesData] = useState(null)
  const [airports, setAirports] = useState([
    { id: 'JFK', name: 'JFK' },
    { id: 'LAX', name: 'LAX' },
    { id: 'ORD', name: 'ORD' },
    { id: 'ATL', name: 'ATL' }
  ]);

  const [airlines, setAirlines] = useState(() => {
    if (!airlinesData) return [];
    return Object.keys(airlinesData)
      .slice(0, 2)
      .map(airlineName => ({
        id: airlineName,
        name: airlineName,
        years: airlinesData[airlineName] || {}
      }));
  });

  const drawerControls = { onOpen, onClose }

  useEffect(() => {
    csv('/Airline_Delay_Cause.csv')
      .then((csvData) => {
        const aggregatedAirportData = csvData.reduce((acc, row) => {
          const airport = row.airport_name;
          const year = row.year;
          const month = row.month;
          const carrier = row.carrier_name;

          if (isNaN(row.latitude) || isNaN(row.longitude)) {
            return acc;
          }

          if (!acc[airport]) {
            acc[airport] = {
              latitude: +row.latitude,
              longitude: +row.longitude
            };
          }
          if (!acc[airport][year]) {
            acc[airport][year] = {};
          }
          if (!acc[airport][year][month]) {
            acc[airport][year][month] = {};
          }
          if (!acc[airport][year][month][carrier]) {
            acc[airport][year][month][carrier] = {
              arr_flights: +row.arr_flights,
              arr_del15: +row.arr_del15,
              carrier_ct: +row.carrier_ct,
              weather_ct: +row.weather_ct,
              nas_ct: +row.nas_ct,
              security_ct: +row.security_ct,
              late_aircraft_ct: +row.late_aircraft_ct,
              arr_cancelled: +row.arr_cancelled,
              arr_diverted: +row.arr_diverted,
              arr_delay: +row.arr_delay,
              carrier_delay: +row.carrier_delay,
              weather_delay: +row.weather_delay,
              nas_delay: +row.nas_delay,
              security_delay: +row.security_delay,
              late_aircraft_delay: +row.late_aircraft_delay
            };
          }
          return acc;
        }, {});

        const aggregatedAirlinesData = csvData.reduce((acc, row) => {
          const carrier = row.carrier_name;
          const year = row.year;
          const month = row.month;
          const airport = row.airport_name;

          if (isNaN(row.latitude) || isNaN(row.longitude)) {
            return acc;
          }

          if (!acc[carrier]) {
            acc[carrier] = {};
          }
          if (!acc[carrier][year]) {
            acc[carrier][year] = {};
          }
          if (!acc[carrier][year][month]) {
            acc[carrier][year][month] = {};
          }
          if (!acc[carrier][year][month][airport]) {
            acc[carrier][year][month][airport] = {
              latitude: +row.latitude,
              longitude: +row.longitude,
              arr_flights: +row.arr_flights,
              arr_del15: +row.arr_del15,
              carrier_ct: +row.carrier_ct,
              weather_ct: +row.weather_ct,
              nas_ct: +row.nas_ct,
              security_ct: +row.security_ct,
              late_aircraft_ct: +row.late_aircraft_ct,
              arr_cancelled: +row.arr_cancelled,
              arr_diverted: +row.arr_diverted,
              arr_delay: +row.arr_delay,
              carrier_delay: +row.carrier_delay,
              weather_delay: +row.weather_delay,
              nas_delay: +row.nas_delay,
              security_delay: +row.security_delay,
              late_aircraft_delay: +row.late_aircraft_delay
            };
          }
          return acc;
        }, {});
        console.log(aggregatedAirportData);
        console.log(aggregatedAirlinesData);
        setAirportData(aggregatedAirportData);
        setAirlinesData(aggregatedAirlinesData);
      })
      .catch((error) => {
        console.error('Error loading CSV:', error);
      });
  }, []);

  return (
    <Flex direction="column" h="100vh">
      <Box as="nav" bg="blue.500" color="white" p={4}>
        <Tabs
          variant="enclosed"
          colorScheme="blue"
          onChange={(index) => {
            if (index === 0) setShowChart('single')
            else if (index === 1) setShowChart('compareAirports')
            else if (index === 2) setShowChart('compareAirlines')
          }}>
          <TabList>
            <Tab
              _selected={{
                bg: '#466a9e',
                color: 'white',
                border: '1px solid white'
              }}
              _hover={{
                bg: '#5686c2',
                border: '1px solid white'
              }}
              mx={1}>
              Airport
            </Tab>
            <Tab
              _selected={{
                bg: '#466a9e',
                color: 'white',
                border: '1px solid white'
              }}
              _hover={{
                bg: '#5686c2',
                border: '1px solid white'
              }}
              mx={1}>
              Compare Airports
            </Tab>
            <Tab
              _selected={{
                bg: '#466a9e',
                color: 'white',
                border: '1px solid white'
              }}
              _hover={{
                bg: '#5686c2',
                border: '1px solid white'
              }}
              mx={1}>
              Compare Airlines
            </Tab>
          </TabList>
        </Tabs>
      </Box>

      <Drawer isOpen={isOpen} placement="top" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton size="lg" p={6} fontSize="20px" />
          <DrawerHeader>Select Airport</DrawerHeader>
          <DrawerBody>
            <Mapcontainer
              data={airportData}
              onAirportSelect={(airport) => {
                setMainAirport(airport);
                onClose(); // Close the drawer after selection
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {showChart === 'single' && (
        <Chartcontainer
          data={airportData}
          mainAirport={mainAirport}
          drawerControls={drawerControls}
        />
      )}
      {showChart === 'compareAirports' && (
        <Multichart
          type="airports"
          data={airportData}
          drawerControls={drawerControls}
          airports={airports}
          setAirports={setAirports}
        />
      )}
      {showChart === 'compareAirlines' && (
        <Multichart
          type="airlines"
          data={airlinesData}
          drawerControls={drawerControls}
          airlines={airlines}
          setAirlines={setAirlines}
        />
      )}
    </Flex>
  )
}

export default Container
