import { Box, Image } from "@chakra-ui/react";
import PostFooter from "./PostFooter.tsx";
import PostHeader from "./PostHeader.tsx";

interface IFeedPost {
  img: string;
  username: string;
  avatar: string;
}
const FeedPost = ({ img, username, avatar }: IFeedPost) => {
  return (
    <>
      <PostHeader username={username} avatar={avatar} />
      <Box my={2} borderRadius={4} overflow={"hidden"}>
        <Image src={img} alt={username} />
      </Box>
      <PostFooter username={username} />
    </>
  );
};

export default FeedPost;
