// post.js
import { NextPage } from 'next';
import sanityClient from '@/lib/client';

import { isPast } from 'date-fns';

import { Box, Container, Typography } from '@material-ui/core';

import { Page, DonateForm, Video } from '@/components';

const PerformancePage: NextPage<PerformanceProps> = ({
    name,
    vimeoID,
    releaseDate,
    oranizations,
    actors,
    sponsors,
    queuePosition,
    totalPerformances,
    sponsorMatch,
    excludeFromCount,
}) => {
    const isReleased = isPast(new Date(releaseDate));

    console.log('queuePosition:', queuePosition);
    console.log('totalPerformances:', totalPerformances);
    console.log('excludeFromCount:', excludeFromCount);

    // logic for 404
    // logic for un-released video date

    return (
        <Page
            metaTitle="Dare2Have Nerve Fundraiser"
            metaDescription="Say something cool here"
        >
            <Box className="app-content" py={20}>
                {name}
                <Video vimeoID={vimeoID} />
                <DonateForm />
            </Box>
        </Page>
    );
};

const singlePerformanceQuery = `*[_type == "performance" && slug.current == $slug][0]{
    name,
    tldr,
    excludeFromCount,
    releaseDate,
    vimeoID,
    organizations[]->{
        name,
        "logo": logo.asset._ref,
        primaryColor,
        description,
        website,
        ein
    },
    actors[]->{
        name
    },
    sponsors[]->{
        name,
        bio,
        "logo": logo.asset._ref,
        website,
        match
    }
}`;

const allPerformancesQuery = `*[_type == "performance" && excludeFromCount != true] | order(releaseDate asc)`;

PerformancePage.getInitialProps = async (context) => {
    // It's important to default the slug so that it doesn't return "undefined"
    const { slug = '' } = context.query;
    const getSinglePerformance = sanityClient.fetch(singlePerformanceQuery, {
        slug,
    });
    const getAllPerformances = sanityClient.fetch(allPerformancesQuery, {});
    const [singlePerformance, performances] = await Promise.all([
        getSinglePerformance,
        getAllPerformances,
    ]);

    // How many performances are there?
    const totalPerformances = performances.length;

    // Video X of X (where in the queue was this video released)
    const queuePosition: number | undefined = singlePerformance.excludeFromCount
        ? undefined
        : performances.findIndex(
              (performance: any) => performance.slug.current === slug
          ) + 1;

    return singlePerformance
        ? {
              ...singlePerformance,
              slug,
              queuePosition,
              totalPerformances,
          }
        : {};
};

type Organization = {
    name: string;
    logo: string;
    primaryColor: string;
    description: string;
    website: string;
    ein: string;
};

type Actor = {
    name: string;
};

type Sponsor = {
    name: string;
    logo: string;
    bio: string;
    website: string;
    match: string;
};

type Performance = {
    name: string;
    tldr: string;
    vimeoID: string;
    releaseDate: string;
    excludeFromCount: boolean;
    logo: string;
    organizations: Organization[];
    actors: Actor[];
    sponsors: Sponsor[];
};

interface PerformanceProps extends Performance {
    slug: string;
    queuePosition: number;
    totalPerformances: number;
    sponsorMatch: number;
}

export default PerformancePage;
